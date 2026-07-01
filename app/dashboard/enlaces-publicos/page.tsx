import type { Metadata } from "next";
import SharedCalendarsShell from "./_components/shared-calendars-shell";

export const metadata: Metadata = {
  title: "Calendarios Compartidos - Bookiri",
  description:
    "Genera enlaces públicos de solo lectura para compartir la disponibilidad de tus viviendas con clientes y colaboradores.",
};

export default function EnlacesPublicosPage() {
  return <SharedCalendarsShell />;
}
