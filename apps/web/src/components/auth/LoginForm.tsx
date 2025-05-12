"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

// Esquema de validación
const loginSchema = z.object({
  email: z.string().email("Por favor, introduce un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export default function LoginForm() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Si el usuario ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiamos el error específico
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Siempre limpiamos el error general al modificar cualquier campo
    if (generalError) {
      setGeneralError("");
    }
  };

  const validate = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    // Validamos los datos
    if (!validate()) return;

    setIsLoading(true);

    try {
      console.log("Intentando iniciar sesión con:", formData.email);

      // Intentamos iniciar sesión
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      console.log("Resultado de signIn:", result);

      if (result?.error) {
        console.error("Error al iniciar sesión:", result.error);
        setGeneralError(result.error);
        setErrors((prev) => ({
          ...prev,
          password: " ", // Un espacio para activar el estilo de error sin mostrar mensaje
        }));
      } else if (result?.ok) {
        console.log("Inicio de sesión exitoso, redirigiendo a:", callbackUrl);
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Error inesperado al iniciar sesión:", error);
      setGeneralError(
        "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Si ya está autenticado, mostrar un mensaje de redirección
  if (status === "authenticated") {
    return (
      <div className="text-center py-8">
        <p className="mb-2">Ya has iniciado sesión</p>
        <p className="text-grey-stone">Redirigiendo al dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{generalError}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`input w-full ${errors.email ? "border-red-500" : ""}`}
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.email && errors.email.trim() && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">
            Contraseña
          </label>
          <a
            href="/auth/recover-password"
            className="text-sm text-eco-green hover:text-lime-accent"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`input w-full ${errors.password ? "border-red-500" : ""}`}
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.password && errors.password.trim() && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Iniciando sesión...
            </div>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p>Credenciales de prueba:</p>
        <p>Email: prueba@test.com</p>
        <p>Contraseña: Contraseña123!</p>
      </div>
    </form>
  );
}
