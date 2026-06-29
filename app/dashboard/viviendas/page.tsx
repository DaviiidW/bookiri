import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viviendas - Bookiri",
  description: "Administra las propiedades y viviendas vacacionales registradas en el sistema.",
};

export default function ViviendasPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Viviendas
        </h1>
      </div>
    </div>
  );
}
