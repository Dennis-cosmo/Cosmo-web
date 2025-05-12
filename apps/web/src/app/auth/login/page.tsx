import { Metadata } from "next";
import LoginPageContent from "../../../components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Iniciar sesión | Cosmo",
  description: "Inicia sesión en tu cuenta de Cosmo",
};

export default function LoginPage() {
  return <LoginPageContent />;
}
