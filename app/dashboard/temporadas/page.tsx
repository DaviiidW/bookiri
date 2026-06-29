import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Temporadas - Bookiri",
  description: "Configura las temporadas de tarifas (alta, media, baja) y reglas de precio.",
};

export default function TemporadasPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Temporadas
        </h1>
      </div>
    </div>
  );
}
