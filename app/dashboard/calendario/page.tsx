import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendario - Bookiri",
  description: "Visualiza y gestiona el calendario de reservas de tus viviendas.",
};

export default function CalendarioPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Calendario
        </h1>
      </div>
    </div>
  );
}
