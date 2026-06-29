"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
  session: {
    user: {
      email: string;
      id: string;
    };
  };
}

export default function DashboardClient({ session }: DashboardClientProps) {
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
    <div className="max-w-4xl w-full mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Panel de Control
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Bienvenido al gestor de viviendas vacacionales de Bookiri.
          </p>
        </div>

        <section className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="border-b border-slate-800/80 pb-6 mb-6">
            <h2 className="text-xl font-bold text-white">Gestión de la Cuenta</h2>
            <p className="text-sm text-slate-400 mt-1">
              Administra tu perfil de usuario y accesos al sistema.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  ID de Usuario
                </span>
                <div className="px-4 py-3 bg-slate-950/50 border border-slate-900 rounded-xl text-slate-400 font-mono text-xs overflow-x-auto">
                  {session.user.id}
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Dirección de Correo
                </span>
                <div className="px-4 py-3 bg-slate-950/50 border border-slate-900 rounded-xl text-slate-300 text-sm">
                  {session.user.email}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-8 mt-6">
              <h3 className="text-md font-bold text-red-400 mb-2">Zona de Peligro</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Si eliminas tu cuenta, se desactivará tu acceso al sistema inmediatamente. Toda la información histórica del negocio (viviendas, precios, facturación e historial de reservas) se conservará de forma segura por motivos de auditoría y trazabilidad del negocio.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/40 border border-red-800/50 text-red-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Eliminar mi cuenta
              </button>
            </div>
          </div>
        </section>


      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-3">¿Estás absolutamente seguro?</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Esta acción es irreversible. Se desactivará tu usuario de administrador y no podrás volver a iniciar sesión. La información histórica se conservará por trazabilidad.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs text-center">
                {deleteError}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Escribe <span className="text-red-400 font-mono font-bold">ELIMINAR</span> para confirmar:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-mono"
              />
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText("");
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== "ELIMINAR"}
                className="px-5 py-2 text-xs font-semibold bg-red-650 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center min-w-[100px]"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
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
