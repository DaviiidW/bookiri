"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen w-full flex bg-white text-zinc-900 font-sans">
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden border-r border-zinc-200">
        <div
          className="absolute inset-0 h-full w-full bg-white"
          style={{ background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #2563eb 100%)" }}
        ></div>

        <div className="relative z-10 flex items-center justify-center">
          <Image
            src="/Logo_Bookiri-Photoroom.webp"
            alt="Bookiri Logo"
            width={350}
            height={350}
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-between p-8 relative min-h-screen lg:min-h-0">
        <div className="hidden lg:block h-1"></div>
        
        <div className="w-full max-w-[380px] flex flex-col relative z-10 my-auto">

          <div className="text-center mb-10 flex flex-col items-center">
            <div className="lg:hidden mb-6">
              <Image
                src="/Logo_Bookiri-Photoroom.webp"
                alt="Bookiri Logo"
                width={150}
                height={150}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">
              Iniciar sesión
            </h1>
            <p className="text-zinc-500 text-sm">
              ¡Bienvenido! Por favor, inicia sesión para continuar.
            </p>
          </div>

          {registered && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
              ¡Cuenta creada con éxito! Introduce tus credenciales para acceder.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Introduce el correo electrónico"
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce la contraseña"
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-4 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Continuar"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-zinc-500">¿No tienes una cuenta? </span>
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Regístrate
            </Link>
          </div>
        </div>

        <div className="text-xs text-zinc-400 flex gap-3 mt-8 pb-4 lg:pb-0">
          <span>© Bookiri</span>
          <span>·</span>
          <Link href="#" className="hover:text-zinc-600 transition-colors">Privacidad</Link>
          <span>·</span>
          <Link href="#" className="hover:text-zinc-600 transition-colors">Términos</Link>
        </div>
      </div>
    </div>
  );
}
