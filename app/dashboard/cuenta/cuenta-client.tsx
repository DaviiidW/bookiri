"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CuentaClientProps {
  session: {
    user: {
      email: string;
      id: string;
    };
  };
}

export default function CuentaClient({ session }: CuentaClientProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "ELIMINAR") {
      setDeleteError("Por favor, escribe ELIMINAR para confirmar.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await signOut({ callbackUrl: "/login" });
      } else {
        setDeleteError(data.error || "No se pudo eliminar la cuenta.");
      }
    } catch (err) {
      setDeleteError("Ocurrió un error de red. Inténtalo de nuevo.");
      console.error("Delete account error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto bg-white border border-zinc-200 rounded-3xl shadow-xl p-6 md:p-10 relative overflow-hidden text-zinc-800">
      <div className="mb-10 relative z-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Mi perfil
        </h1>
      </div>

      <section className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-6 md:p-8 shadow-sm relative z-10">
        <div className="border-b border-zinc-200 pb-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Gestión de la Cuenta</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Administra tu perfil de usuario y accesos al sistema.
          </p>
        </div>

          <div className="space-y-6">
            <div>
              <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Dirección de Correo
              </span>
              <div className="px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-700 text-sm max-w-md">
                {session.user.email}
              </div>
            </div>

          <div className="border-t border-zinc-200 pt-8 mt-6">
            <h3 className="text-md font-bold text-red-650 mb-2">Eliminar mi cuenta</h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Si eliminas tu cuenta, se desactivará tu acceso al sistema inmediatamente. Toda la información histórica del negocio (viviendas, precios, facturación e historial de reservas) se conservará de forma segura por motivos de auditoría y trazabilidad del negocio.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </section>


      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative text-zinc-800 animate-scale-up">
            <h3 className="text-xl font-bold text-zinc-900 mb-3">¿Estás absolutamente seguro?</h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-5">
              Esta acción es irreversible. Se desactivará tu usuario de administrador y no podrás volver a iniciar sesión. La información histórica se conservará por trazabilidad.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs text-center">
                {deleteError}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-semibold text-zinc-500 mb-2">
                Escribe <span className="text-red-600 font-mono font-bold">ELIMINAR</span> para confirmar:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono"
              />
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText("");
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== "ELIMINAR"}
                className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center min-w-[100px]"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-zinc-300 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
