import { Metadata } from "next";
import RegisterForm from "../../../components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Registro | Cosmo",
  description: "Crea una nueva cuenta en Cosmo",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 bg-white">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-eco-green flex items-center justify-center mr-2">
              <span className="font-bold text-pure-white text-xl">C</span>
            </div>
            <span className="font-bold text-2xl text-gray-800">Cosmo</span>
          </div>
          <h1 className="text-3xl font-bold mt-4 mb-2 text-gray-800">
            Crea tu cuenta
          </h1>
          <p className="text-gray-600">
            Únete a Cosmo y comienza a gestionar finanzas sostenibles
          </p>
        </div>

        <div className="rounded-lg shadow-card p-4 sm:p-6 md:p-8 bg-white border border-gray-300">
          <RegisterForm />
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
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
