import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro exitoso | Cosmo",
  description: "Registro completado con éxito en Cosmo",
};

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pure-white dark:bg-deep-space">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-eco-green flex items-center justify-center mr-2">
              <span className="font-bold text-pure-white text-xl">C</span>
            </div>
            <span className="font-bold text-2xl text-charcoal dark:text-pure-white">
              Cosmo
            </span>
          </div>
        </div>

        <div className="bg-pure-white dark:bg-cosmo-400 rounded-lg shadow-card p-8 mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-lime-accent/20 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-eco-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">¡Registro exitoso!</h1>
          <p className="text-grey-stone mb-6">
            Tu cuenta ha sido creada con éxito. Te hemos enviado un correo de
            confirmación a tu dirección de email. Por favor, verifica tu bandeja
            de entrada.
          </p>

          <Link href="/auth/login" className="btn-primary w-full block py-3">
            Iniciar sesión
          </Link>
        </div>

        <p className="text-grey-stone">
          ¿Tienes problemas para iniciar sesión?{" "}
          <a href="#" className="text-eco-green hover:text-lime-accent">
            Contacta con soporte
          </a>
        </p>
      </div>
    </div>
  );
}
