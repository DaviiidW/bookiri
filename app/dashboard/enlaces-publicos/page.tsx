import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enlaces Públicos - Bookiri",
  description: "Administra y comparte enlaces públicos para que tus huéspedes realicen reservas directas.",
};

export default function EnlacesPublicosPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Enlaces Públicos
        </h1>
      </div>
    </div>
  );
}
