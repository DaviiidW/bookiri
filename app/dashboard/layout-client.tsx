"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { Menu } from "lucide-react";
import Image from "next/image";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  session: {
    user: {
      email: string;
      id: string;
      name?: string | null;
    };
  };
}

export default function DashboardLayoutClient({
  children,
  session,
}: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const isExpanded = isSidebarOpen || isSidebarHovered;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans overflow-x-hidden">
      <header className="lg:hidden h-10 w-full flex items-center px-4 bg-white border-b border-zinc-200 fixed top-0 left-0 right-0 z-30 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="ml-3 flex items-center gap-2">
          <Image 
            src="/Logo_icono.webp" 
            alt="Bookiri" 
            width={24} 
            height={24} 
            className="object-contain rounded-lg flex-shrink-0"
          />
          <span className="text-base font-bold text-zinc-900 tracking-tight select-none">
            Bookiri
          </span>
        </div>
      </header>

      <div className="flex flex-1 relative min-h-[calc(100vh-2.5rem)] lg:min-h-screen pt-10 lg:pt-0">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isHovered={isSidebarHovered}
          onHoverChange={setIsSidebarHovered}
          session={session}
        />

        <main
          className={`flex-1 flex flex-col min-h-full transition-all duration-300 ease-in-out overflow-x-hidden
            ${isMounted && isExpanded ? "lg:pl-64" : "lg:pl-16 pl-0"}
          `}
        >
          <div className="flex-1 w-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
