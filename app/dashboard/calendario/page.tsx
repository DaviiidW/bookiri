import type { Metadata } from "next";
import CalendarShell from "./_components/calendar-shell";

export const metadata: Metadata = {
  title: "Calendario - Bookiri",
  description: "Visualiza y gestiona el calendario de reservas de tus viviendas.",
};

export default function CalendarioPage() {
  return (
    <div className="w-full text-zinc-800">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
          Calendario
        </h1>
      </div>
      <CalendarShell />
    </div>
  );
}
