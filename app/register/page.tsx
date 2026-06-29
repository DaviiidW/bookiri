import RegisterForm from "./register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta - Bookiri",
  description: "Crea tu cuenta de administrador de Bookiri para gestionar viviendas vacacionales, reservas y precios.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
