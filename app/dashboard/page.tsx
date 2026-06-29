import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Control - Bookiri",
  description: "Administra las reservas y precios de tus propiedades desde el panel de control de Bookiri.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardClient session={session} />;
}
