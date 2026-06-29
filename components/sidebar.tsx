"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, CalendarDays, Globe, User } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Calendario", href: "/dashboard/calendario", icon: Calendar },
    { name: "Viviendas", href: "/dashboard/viviendas", icon: Home },
    { name: "Temporadas", href: "/dashboard/temporadas", icon: CalendarDays },
    { name: "Enlaces públicos", href: "/dashboard/enlaces-publicos", icon: Globe },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`fixed top-0 lg:top-16 bottom-0 left-0 z-50 lg:z-20 bg-slate-950 border-r border-slate-900 flex flex-col justify-between transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-16 w-64"}
        `}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 flex items-center px-6 border-b border-slate-900 lg:hidden flex-shrink-0">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
              Bookiri
            </span>
          </div>

          <nav className="flex-1 py-6 space-y-1.5 px-3 overflow-y-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    onClose();
                  }}
                  className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive
                      ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 
                      ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300"}
                    `}
                  />
                  <span
                    className={`text-sm tracking-wide transition-all duration-200 whitespace-nowrap overflow-hidden
                      ${isOpen ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 lg:hidden"}
                    `}
                  >
                    {item.name}
                  </span>

                  {!isOpen && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden lg:block whitespace-nowrap z-50 shadow-xl">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-900 flex-shrink-0">
          <Link
            href="/dashboard/cuenta"
            onClick={() => {
              onClose();
            }}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative
              ${pathname === "/dashboard/cuenta"
                ? "bg-slate-900 border border-slate-800 text-slate-200 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
              }
            `}
          >
            <User
              className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105
                ${pathname === "/dashboard/cuenta" ? "text-slate-200" : "text-slate-400 group-hover:text-slate-300"}
              `}
            />
            <span
              className={`text-sm tracking-wide transition-all duration-200 whitespace-nowrap overflow-hidden
                ${isOpen ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 lg:hidden"}
              `}
            >
              Mi Cuenta
            </span>

            {!isOpen && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden lg:block whitespace-nowrap z-50 shadow-xl">
                Mi Cuenta
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
