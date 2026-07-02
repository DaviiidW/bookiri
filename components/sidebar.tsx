"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Calendar, Home, CalendarDays, Globe, User, LogOut, ChevronsUpDown } from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  session: {
    user: {
      email: string;
      id: string;
      name?: string | null;
    };
  } | null;
}

export default function Sidebar({ isOpen, onClose, isHovered, onHoverChange, session }: SidebarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isExpanded = isOpen || isHovered;

  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || userEmail.split("@")[0] || "Usuario";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

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
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => {
          onHoverChange(false);
          setIsMenuOpen(false);
        }}
        className={`fixed top-0 bottom-0 left-0 z-50 lg:z-20 bg-white border-r border-zinc-200 flex flex-col justify-between transition-all duration-300 ease-in-out
          ${isOpen 
            ? "translate-x-0 w-64" 
            : `-translate-x-full lg:translate-x-0 w-64 ${isHovered ? "lg:w-64" : "lg:w-16"}`
          }
        `}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 flex items-center px-4 border-b border-zinc-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Image 
                src="/Logo_icono.webp" 
                alt="Bookiri" 
                width={32} 
                height={32} 
                className="object-contain rounded-lg flex-shrink-0"
              />
              <span className={`text-lg font-bold text-zinc-900 tracking-tight transition-all duration-200 whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 lg:hidden'}`}>
                Bookiri
              </span>
            </div>
          </div>

          <nav className="flex-1 py-6 space-y-1.5 px-3 overflow-y-auto scrollbar-none">
            {navItems.map((item, index) => {
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
                      ? "bg-indigo-50 border border-indigo-100/50 text-indigo-600 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 
                      ${isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-600"}
                    `}
                  />
                  <span
                    className={`text-sm tracking-wide transition-all duration-200 ease-out whitespace-nowrap overflow-hidden
                      ${isExpanded 
                        ? "opacity-100 max-w-[200px] translate-x-0" 
                        : "opacity-0 max-w-0 -translate-x-2 pointer-events-none lg:hidden"
                      }
                    `}
                    style={{
                      transitionDelay: isExpanded ? `${index * 40}ms` : "0ms",
                    }}
                  >
                    {item.name}
                  </span>

                  {!isExpanded && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden lg:block whitespace-nowrap z-50 shadow-xl">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-zinc-200 flex-shrink-0 relative">
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute bottom-full left-3 mb-2 w-60 bg-white border border-zinc-200 rounded-xl shadow-xl p-3 z-50 flex flex-col gap-2.5 transition-all duration-200 select-none">
                <div className="flex items-center gap-3 pb-2.5 border-b border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-100 font-semibold text-sm flex-shrink-0 shadow-sm">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 truncate leading-tight">
                      {userName}
                    </p>
                    <p className="text-xs text-zinc-500 truncate leading-tight mt-0.5 animate-pulse-slow">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Link
                    href="/dashboard/cuenta"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onClose();
                    }}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 transition-colors duration-150 cursor-pointer font-medium"
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>Mi perfil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-2.5 py-2 rounded-lg text-sm text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 transition-colors duration-150 cursor-pointer font-medium focus:outline-none"
                  >
                    <LogOut className="w-4 h-4 text-zinc-400" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative cursor-pointer border border-transparent text-left
              ${isMenuOpen || pathname === "/dashboard/cuenta"
                ? "bg-zinc-50 border-zinc-200 text-zinc-900 font-semibold"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }
            `}
          >
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-zinc-100 flex items-center justify-center text-[10px] font-semibold flex-shrink-0 transition-transform duration-200 group-hover:scale-105 select-none shadow-sm">
              {userInitials}
            </div>

            <span
              className={`text-sm tracking-wide transition-all duration-200 ease-out whitespace-nowrap overflow-hidden text-left flex-1
                ${isExpanded 
                  ? "opacity-100 max-w-[120px] translate-x-0" 
                  : "opacity-0 max-w-0 -translate-x-2 pointer-events-none lg:hidden"
                }
              `}
              style={{
                transitionDelay: isExpanded ? `${navItems.length * 40}ms` : "0ms",
              }}
            >
              Mi Cuenta
            </span>

            {isExpanded && (
              <ChevronsUpDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors duration-200 flex-shrink-0" />
            )}

            {!isExpanded && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden lg:block whitespace-nowrap z-50 shadow-xl">
                Mi Cuenta
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
