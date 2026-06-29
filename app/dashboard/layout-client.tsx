"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  session: {
    user: {
      email: string;
      id: string;
    };
  };
}

export default function DashboardLayoutClient({
  children,
  session,
}: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      <Header
        userEmail={session?.user?.email}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1 relative min-h-[calc(100vh-4rem)]">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        <main
          className={`flex-1 flex flex-col min-h-full transition-all duration-300 ease-in-out overflow-x-hidden
            ${isMounted && isSidebarOpen ? "lg:pl-64" : "lg:pl-16 pl-0"}
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
