import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "../dashboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Cuenta - Bookiri",
  description: "Administra tu perfil de usuario y accesos al sistema.",
};

export default async function CuentaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardClient session={session} />;
}
