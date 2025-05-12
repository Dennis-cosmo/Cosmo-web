"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DirectLoginForm from "./DirectLoginForm";

export default function LoginPageContent() {
  const { status } = useSession();
  const router = useRouter();

  // Si el usuario ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

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
          {status === "loading" ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-eco-green mx-auto"></div>
              <p className="mt-4 text-grey-stone">Verificando sesión...</p>
            </div>
          ) : status === "authenticated" ? (
            <div className="py-8 text-center">
              <p className="text-green-600 font-medium">
                Ya has iniciado sesión
              </p>
              <p className="mt-2 text-grey-stone">
                Redirigiendo al dashboard...
              </p>
            </div>
          ) : (
            <DirectLoginForm />
          )}
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
