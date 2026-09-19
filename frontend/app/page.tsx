'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

type User = {
  user_id: string;
  username: string | null;
  email: string;
  created_at?: string | null;
};

const API_URL = 'http://localhost:3001';

export default function Home() {
  const [email, setEmail] =
    useState('admin@siplap.com');

  const [pass, setPass] =
    useState('Admin123!');

  const [user, setUser] =
    useState<User | null>(null);

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  // ==========================================
  // RECUPERAR SESIÓN AL RECARGAR
  // ==========================================
  useEffect(() => {
    async function restoreSession() {
      const token =
        localStorage.getItem(
          'access_token',
        );

      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          localStorage.removeItem(
            'access_token',
          );

          setCheckingSession(false);
          return;
        }

        const profile: User =
          await response.json();

        setUser(profile);
      } catch {
        localStorage.removeItem(
          'access_token',
        );
      } finally {
        setCheckingSession(false);
      }
    }

    restoreSession();
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================
  async function handleLogin(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const loginResponse =
        await fetch(
          `${API_URL}/auth/login`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              email,
              pass,
            }),
          },
        );

      if (!loginResponse.ok) {
        throw new Error(
          'Correo o contraseña incorrectos',
        );
      }

      const loginData =
        await loginResponse.json();

      const accessToken =
        loginData.access_token;

      if (!accessToken) {
        throw new Error(
          'El servidor no devolvió un token',
        );
      }

      // Guardar JWT sin mostrarlo
      localStorage.setItem(
        'access_token',
        accessToken,
      );

      const profileResponse =
        await fetch(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          },
        );

      if (!profileResponse.ok) {
        localStorage.removeItem(
          'access_token',
        );

        throw new Error(
          'No se pudo obtener el perfil',
        );
      }

      const profile: User =
        await profileResponse.json();

      setUser(profile);
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

  // ==========================================
  // LOGOUT
  // ==========================================
  function handleLogout() {
    localStorage.removeItem(
      'access_token',
    );

    setUser(null);
    setError('');
  }

  // ==========================================
  // VALIDANDO SESIÓN
  // ==========================================
  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-600">
            Verificando sesión...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // USUARIO LOGUEADO
  // ==========================================
  if (user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">

            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              👨‍💼
            </div>

            <h1 className="text-3xl font-bold">
              ¡Bienvenido!
            </h1>

            <p className="text-blue-100 mt-1">
              Sesión validada correctamente
            </p>

          </div>

          <div className="p-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-gray-50 p-5 rounded-2xl border">

                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  ID de Usuario
                </p>

                <p className="text-gray-900 font-mono text-sm break-all">
                  {user.user_id}
                </p>

              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border">

                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Nombre
                </p>

                <p className="text-gray-900 font-semibold">
                  {user.username ??
                    'Sin nombre'}
                </p>

              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border md:col-span-2">

                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Correo Electrónico
                </p>

                <p className="text-gray-900">
                  {user.email}
                </p>

              </div>

              {user.created_at && (
                <div className="bg-gray-50 p-5 rounded-2xl border md:col-span-2">

                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Miembro desde
                  </p>

                  <p className="text-gray-900">
                    {new Date(
                      user.created_at,
                    ).toLocaleDateString(
                      'es-MX',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </p>

                </div>
              )}

            </div>

            {/* YA NO MOSTRAMOS EL JWT */}

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">

              <h2 className="font-bold text-blue-900">
                Panel de Administración
              </h2>

              <p className="text-sm text-blue-700 mt-1">
                Administra los usuarios registrados
                en el sistema.
              </p>

              <button
                onClick={() => {
                  window.location.href =
                    '/users';
                }}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
              >
                Administrar usuarios
              </button>

            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-8 border-2 border-red-100 hover:bg-red-50 text-red-600 font-semibold py-3 rounded-xl transition"
            >
              Cerrar Sesión
            </button>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // LOGIN
  // ==========================================
  return (
    <main className="min-h-screen flex">

      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 items-center justify-center p-12">

        <div className="text-center max-w-lg">

          <div className="mb-10 bg-white px-8 py-5 rounded-3xl inline-flex">

            <img
              src="/logo-uo.png"
              alt="Universidad de Oriente"
              className="h-16 w-auto"
            />

          </div>

          <h1 className="text-4xl font-extrabold text-white mb-6">
            Universidad de Oriente
          </h1>

          <p className="text-lg text-blue-100">
            Sistema integral de gestión de
            usuarios, roles y control de acceso.
          </p>

        </div>

      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 lg:bg-white">

        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl lg:shadow-none">

          <div className="mb-8">

            <h2 className="text-3xl font-bold text-gray-900">
              Iniciar Sesión
            </h2>

            <p className="text-gray-500 mt-2">
              Ingresa tus credenciales.
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value,
                  )
                }
                className="w-full px-4 py-3 border rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>

              <input
                type="password"
                value={pass}
                onChange={(e) =>
                  setPass(
                    e.target.value,
                  )
                }
                className="w-full px-4 py-3 border rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition"
            >
              {loading
                ? 'Procesando...'
                : 'Iniciar Sesión'}
            </button>

          </form>

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4">

            <p className="font-bold text-blue-900 text-sm">
              SUPERUSUARIO de prueba
            </p>

            <p className="text-xs text-blue-700 mt-1">
              Usuario: admin@siplap.com
            </p>

            <p className="text-xs text-blue-700">
              Clave: Admin123!
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}