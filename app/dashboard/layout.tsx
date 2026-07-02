import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const formattedSession = {
    user: {
      email: session.user.email ?? "",
      id: session.user.id ?? "",
      name: session.user.name ?? null,
    },
  };

  return (
    <DashboardLayoutClient session={formattedSession}>
      {children}
    </DashboardLayoutClient>
  );
}
