'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

type Role = {
  roles: {
    name: string | null;
  };
};

type User = {
  user_id: string;
  username: string | null;
  email: string;

  user_statuses?: {
    name: string;
  };

  user_roles?: Role[];
};

type Profile = {
  user_id: string;
  username: string | null;
  email: string;
};

type FormData = {
  username: string;
  email: string;
  password: string;
};

const API_URL = 'http://localhost:3001';

export default function UsersPage() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [message, setMessage] =
    useState('');

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingUser,
    setEditingUser,
  ] = useState<User | null>(null);

  const [
    formData,
    setFormData,
  ] = useState<FormData>({
    username: '',
    email: '',
    password: '',
  });

  // ==========================================
  // TOKEN
  // ==========================================
  function getToken() {
    return localStorage.getItem(
      'access_token',
    );
  }

  // ==========================================
  // REDIRIGIR AL LOGIN
  // ==========================================
  function redirectToLogin() {
    localStorage.removeItem(
      'access_token',
    );

    window.location.replace('/');
  }

  // ==========================================
  // CARGAR PERFIL + USUARIOS
  // ==========================================
  async function loadUsers() {
    setLoading(true);
    setError('');

    const token = getToken();

    if (!token) {
      redirectToLogin();
      return;
    }

    try {
      // Obtener usuario actualmente logueado
      const profileResponse =
        await fetch(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (profileResponse.status === 401) {
        redirectToLogin();
        return;
      }

      if (!profileResponse.ok) {
        throw new Error(
          'No se pudo verificar la sesión',
        );
      }

      const profile: Profile =
        await profileResponse.json();

      setCurrentUserId(
        profile.user_id,
      );

      // Obtener usuarios
      const usersResponse =
        await fetch(
          `${API_URL}/users`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (usersResponse.status === 401) {
        redirectToLogin();
        return;
      }

      if (usersResponse.status === 403) {
        throw new Error(
          'No tienes permisos de SUPERUSUARIO',
        );
      }

      if (!usersResponse.ok) {
        throw new Error(
          'No se pudieron cargar los usuarios',
        );
      }

      const data: User[] =
        await usersResponse.json();

      setUsers(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          'Ocurrió un error inesperado',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // ==========================================
  // CREAR
  // ==========================================
  function openCreateForm() {
    setEditingUser(null);

    setFormData({
      username: '',
      email: '',
      password: '',
    });

    setError('');
    setMessage('');
    setShowForm(true);
  }

  // ==========================================
  // EDITAR
  // ==========================================
  function openEditForm(
    user: User,
  ) {
    setEditingUser(user);

    setFormData({
      username:
        user.username ?? '',
      email: user.email,
      password: '',
    });

    setError('');
    setMessage('');
    setShowForm(true);
  }

  // ==========================================
  // CERRAR FORM
  // ==========================================
  function closeForm() {
    setShowForm(false);
    setEditingUser(null);

    setFormData({
      username: '',
      email: '',
      password: '',
    });
  }

  // ==========================================
  // CREAR / ACTUALIZAR
  // ==========================================
  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError('');
    setMessage('');

    const token = getToken();

    if (!token) {
      redirectToLogin();
      return;
    }

    try {
      let response: Response;

      if (editingUser) {
        const body: {
          username: string;
          email: string;
          password?: string;
        } = {
          username:
            formData.username,

          email:
            formData.email,
        };

        if (
          formData.password.trim()
        ) {
          body.password =
            formData.password;
        }

        response = await fetch(
          `${API_URL}/users/${editingUser.user_id}`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(body),
          },
        );
      } else {
        response = await fetch(
          `${API_URL}/users`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              username:
                formData.username,

              email:
                formData.email,

              password:
                formData.password,
            }),
          },
        );
      }

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'No se pudo guardar el usuario',
        );
      }

      setMessage(
        editingUser
          ? 'Usuario actualizado correctamente'
          : 'Usuario creado correctamente',
      );

      closeForm();

      await loadUsers();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          'Ocurrió un error inesperado',
        );
      }
    }
  }

  // ==========================================
  // ELIMINAR
  // ==========================================
  async function deleteUser(
    user: User,
  ) {
    // Primera protección en frontend
    if (
      user.user_id === currentUserId
    ) {
      setError(
        'No puedes eliminar tu propia cuenta de SUPERUSUARIO',
      );

      return;
    }

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar a ${
          user.username ??
          user.email
        }?`,
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      redirectToLogin();
      return;
    }

    setError('');
    setMessage('');

    try {
      const response =
        await fetch(
          `${API_URL}/users/${user.user_id}`,
          {
            method: 'DELETE',

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'No se pudo eliminar el usuario',
        );
      }

      setMessage(
        'Usuario eliminado correctamente',
      );

      await loadUsers();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================
  function logout() {
    localStorage.removeItem(
      'access_token',
    );

    window.location.replace('/');
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-600">
            Cargando usuarios...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">

          <div>
            <h1 className="text-3xl font-bold">
              Gestión de Usuarios
            </h1>

            <p className="text-blue-100 mt-1">
              Panel de administración para SUPERUSUARIO
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() => {
                window.location.href =
                  '/';
              }}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl"
            >
              Inicio
            </button>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-semibold"
            >
              Cerrar sesión
            </button>

          </div>

        </div>

      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">

        <div className="bg-white rounded-3xl border p-6 mb-6">

          <div className="flex justify-between items-center">

            <div>
              <h2 className="text-2xl font-bold">
                Lista de usuarios
              </h2>

              <p className="text-gray-500 mt-1">
                Total de usuarios:{' '}
                <strong>
                  {users.length}
                </strong>
              </p>
            </div>

            <button
              onClick={
                openCreateForm
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl"
            >
              + Crear usuario
            </button>

          </div>

        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-3xl border p-6 mb-6">

            <div className="flex justify-between mb-6">

              <h3 className="text-xl font-bold">
                {editingUser
                  ? 'Editar usuario'
                  : 'Crear usuario'}
              </h3>

              <button
                onClick={closeForm}
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >

              <input
                type="text"
                value={
                  formData.username
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username:
                      e.target.value,
                  })
                }
                placeholder="Nombre"
                className="border rounded-xl px-4 py-3"
                required
              />

              <input
                type="email"
                value={
                  formData.email
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email:
                      e.target.value,
                  })
                }
                placeholder="Correo"
                className="border rounded-xl px-4 py-3"
                required
              />

              <input
                type="password"
                value={
                  formData.password
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password:
                      e.target.value,
                  })
                }
                placeholder={
                  editingUser
                    ? 'Nueva contraseña (opcional)'
                    : 'Contraseña'
                }
                className="border rounded-xl px-4 py-3"
                required={
                  !editingUser
                }
              />

              <div className="md:col-span-3 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeForm}
                  className="border px-5 py-3 rounded-xl"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold"
                >
                  {editingUser
                    ? 'Guardar cambios'
                    : 'Crear usuario'}
                </button>

              </div>

            </form>

          </div>
        )}

        <div className="bg-white rounded-3xl border overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4">
                    ID
                  </th>

                  <th className="text-left px-6 py-4">
                    Nombre
                  </th>

                  <th className="text-left px-6 py-4">
                    Correo
                  </th>

                  <th className="text-left px-6 py-4">
                    Contraseña
                  </th>

                  <th className="text-left px-6 py-4">
                    Estado
                  </th>

                  <th className="text-left px-6 py-4">
                    Rol
                  </th>

                  <th className="text-center px-6 py-4">
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.map((user) => {
                  const roles =
                    user.user_roles
                      ?.map(
                        (item) =>
                          item.roles.name,
                      )
                      .filter(Boolean)
                      .join(', ');

                  const isCurrentUser =
                    user.user_id ===
                    currentUserId;

                  return (
                    <tr
                      key={
                        user.user_id
                      }
                      className="border-t"
                    >

                      <td className="px-6 py-4 max-w-[180px] truncate font-mono text-sm">
                        {user.user_id}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {user.username ??
                          'Sin nombre'}
                      </td>

                      <td className="px-6 py-4">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">
                        ••••••••
                      </td>

                      <td className="px-6 py-4">
                        {user
                          .user_statuses
                          ?.name ??
                          'Sin estado'}
                      </td>

                      <td className="px-6 py-4">
                        {roles ||
                          'Sin rol'}
                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() =>
                              openEditForm(
                                user,
                              )
                            }
                            className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg"
                          >
                            Editar
                          </button>

                          {isCurrentUser ? (
                            <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-semibold">
                              Tu cuenta
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                deleteUser(
                                  user,
                                )
                              }
                              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg"
                            >
                              Eliminar
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </main>
  );
}