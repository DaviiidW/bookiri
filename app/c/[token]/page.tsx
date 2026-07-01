import type { Metadata } from "next";
import PublicCalendarShell from "./_components/public-calendar-shell";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  return {
    title: "Calendario de disponibilidad - Bookiri",
    description: "Consulta la disponibilidad de las viviendas en tiempo real.",
    robots: { index: false, follow: false },
    other: { "Cache-Control": "no-store" },
  };
}

export default async function PublicCalendarPage({ params }: Props) {
  const { token } = await params;
  return <PublicCalendarShell token={token} />;
}
