"use client";

import { Menu, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface HeaderProps {
  userEmail?: string | null;
  onToggleSidebar: () => void;
}

export default function Header({ userEmail, onToggleSidebar }: HeaderProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 w-full">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight select-none">
              Bookiri
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {userEmail && (
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Sesión iniciada como</p>
              <p className="text-xs font-semibold text-slate-300">{userEmail}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all duration-200 hover:border-slate-700 cursor-pointer shadow-sm hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
