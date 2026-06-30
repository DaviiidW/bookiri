import type { Metadata } from "next";
import CalendarShell from "./_components/calendar-shell";

export const metadata: Metadata = {
  title: "Calendario - Bookiri",
  description: "Visualiza y gestiona el calendario de reservas de tus viviendas.",
};

export default function CalendarioPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Calendario
        </h1>
      </div>
      <CalendarShell />
    </div>
  );
}
