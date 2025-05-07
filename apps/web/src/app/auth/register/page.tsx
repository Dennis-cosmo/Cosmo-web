import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro | Cosmo",
  description: "Crea una nueva cuenta en Cosmo",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pure-white dark:bg-deep-space py-8">
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
          <h1 className="text-3xl font-bold mt-4 mb-2">Crea tu cuenta</h1>
          <p className="text-grey-stone">
            Únete a Cosmo y comienza a gestionar finanzas sostenibles
          </p>
        </div>

        <div className="bg-pure-white dark:bg-cosmo-400 rounded-lg shadow-card p-8">
          <RegisterForm />
        </div>

        <div className="text-center mt-6">
          <p className="text-grey-stone">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/auth/login"
              className="text-eco-green hover:text-lime-accent"
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
