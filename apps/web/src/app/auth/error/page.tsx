import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error de autenticación | Cosmo",
  description: "Error en la autenticación en Cosmo",
};

export default function AuthErrorPage() {
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
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">Error de autenticación</h1>
          <p className="text-grey-stone mb-6">
            Ha ocurrido un error durante el proceso de autenticación. Por favor,
            intenta iniciar sesión nuevamente o contacta con nuestro equipo de
            soporte.
          </p>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Link
              href="/auth/login"
              className="btn-primary flex-1 block py-3 text-center"
            >
              Intentar nuevamente
            </Link>
            <Link href="/" className="btn-outline block py-3 text-center">
              Volver al inicio
            </Link>
          </div>
        </div>

        <p className="text-grey-stone">
          ¿Necesitas ayuda?{" "}
          <a href="#" className="text-eco-green hover:text-lime-accent">
            Contacta con soporte
          </a>
        </p>
      </div>
    </div>
  );
}
