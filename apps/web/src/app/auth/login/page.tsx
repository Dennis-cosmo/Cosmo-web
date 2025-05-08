import { Metadata } from "next";
import LoginForm from "../../../components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Cosmo",
  description: "Inicia sesión en tu cuenta de Cosmo",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pure-white dark:bg-deep-space">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-eco-green flex items-center justify-center mr-2">
              <span className="font-bold text-pure-white text-xl">C</span>
            </div>
            <span className="font-bold text-2xl text-charcoal dark:text-pure-white">
              Cosmo
            </span>
          </div>
          <h1 className="text-3xl font-bold mt-4 mb-2">
            ¡Bienvenido de nuevo!
          </h1>
          <p className="text-grey-stone">
            Inicia sesión con tu cuenta para acceder al dashboard
          </p>
        </div>

        <div className="bg-pure-white dark:bg-cosmo-400 rounded-lg shadow-card p-8">
          <LoginForm />
        </div>

        <div className="text-center mt-6">
          <p className="text-grey-stone">
            ¿No tienes una cuenta?{" "}
            <a
              href="/auth/register"
              className="text-eco-green hover:text-lime-accent"
            >
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
