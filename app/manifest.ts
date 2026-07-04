import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bookiri",
    short_name: "Bookiri",
    description:
      "Gestión de alquileres vacacionales: viviendas, reservas, temporadas y calendarios compartidos.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/Logo_icono.webp",
        sizes: "367x378",
        type: "image/webp",
      },
    ],
  };
}
