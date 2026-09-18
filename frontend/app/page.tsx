'use client';

import { FormEvent, useState } from 'react';

type User = {
  id: string;
  username: string;
  email: string;
  created_at?: string;
};

export default function Home() {
  const [email, setEmail] = useState('carlos@prueba.edu.mx');
  const [pass, setPass] = useState('password123');

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      // 1. Iniciar sesión
      const loginResponse = await fetch(
        'http://localhost:3001/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            pass,
          }),
        },
      );

      if (!loginResponse.ok) {
        throw new Error('Correo o contraseña incorrectos');
      }

      const loginData = await loginResponse.json();
      const accessToken = loginData.access_token;

      setToken(accessToken);

      // 2. Consultar perfil utilizando el JWT
      const profileResponse = await fetch(
        'http://localhost:3001/auth/me',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!profileResponse.ok) {
        throw new Error('No se pudo obtener el perfil');
      }

      const profile = await profileResponse.json();

      setUser(profile);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setUser(null);
    setToken('');
    setError('');
  }

  // ==========================================
  // VISTA: USUARIO LOGUEADO (PERFIL)
  // ==========================================
  if (user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
               <span className="text-4xl">👨‍🎓</span>
            </div>
            <h1 className="text-3xl font-bold">¡Bienvenido!</h1>
            <p className="text-blue-100 mt-1 opacity-90">Sesión validada exitosamente</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ID de Usuario</p>
                <p className="text-gray-900 font-mono text-sm break-all">{user.id}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre</p>
                <p className="text-gray-900 font-semibold">{user.username}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 md:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico</p>
                <p className="text-gray-900">{user.email}</p>
              </div>

              {user.created_at && (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 md:col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Miembro desde</p>
                  <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Token de Seguridad (JWT)
              </p>
              <p className="text-xs bg-gray-50 border border-gray-200 rounded-xl p-4 break-all text-gray-500 font-mono">
                {token}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-8 bg-white border-2 border-red-100 hover:bg-red-50 text-red-600 font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:border-red-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // VISTA: LOGIN (PANTALLA DIVIDIDA)
  // ==========================================
  return (
    <main className="min-h-screen flex bg-white">
      {/* Mitad Izquierda (Branding / Diseño corporativo) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative items-center justify-center p-12 overflow-hidden">
        {/* Círculos decorativos de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-indigo-400 blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center max-w-lg flex flex-col items-center">
          
          {/* Logo Oficial de la Universidad - AHORA CON DISEÑO DE PLACA BLANCA */}
          <div className="mb-10 bg-white px-8 py-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] inline-flex items-center justify-center">
            <img 
              src="/logo-uo.png" 
              alt="Logotipo Universidad de Oriente" 
              className="h-16 w-auto object-contain"
            />
          </div>
          
          <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
            Universidad de Oriente
          </h1>
          <p className="text-lg text-blue-100 font-light leading-relaxed">
            Sistema integral de gestión de roles y control de acceso. Ingresa tus credenciales para acceder a tu panel de administración.
          </p>
        </div>
      </div>

      {/* Mitad Derecha (Formulario) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 lg:bg-white relative">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none border border-gray-100 lg:border-none relative z-10">
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-500">Bienvenido de vuelta, por favor ingresa tus datos.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="ejemplo@universidad.edu.mx"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          {/* Caja de Ayuda / Datos de Prueba */}
          <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="text-sm font-bold text-blue-900 mb-1">Modo de pruebas local</p>
              <p className="text-xs text-blue-700 mb-0.5"><strong>Usuario:</strong> carlos@prueba.edu.mx</p>
              <p className="text-xs text-blue-700"><strong>Clave:</strong> password123</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
} 