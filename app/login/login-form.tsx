"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Correo o contraseña incorrectos");
      } else {
        router.push("/dashboard/calendario");
        router.refresh();
      }
    } catch (err) {
      setError("Ha ocurrido un error inesperado. Inténtalo de nuevo.");
      console.error("Login submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-6 z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
            Bookiri
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Gestión de reservas de viviendas vacacionales
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:border-slate-700/50">
          <h2 className="text-xl font-bold text-slate-100 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {registered && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-sm text-center">
              ¡Cuenta creada con éxito! Introduce tus credenciales para acceder.
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-sm text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@bookiri.com"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-650/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none mt-2 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-slate-400">¿No tienes cuenta? </span>
            <Link
              href="/register"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
