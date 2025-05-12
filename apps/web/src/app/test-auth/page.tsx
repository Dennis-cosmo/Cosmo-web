"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function TestAuthPage() {
  const [email, setEmail] = useState("prueba@test.com");
  const [password, setPassword] = useState("Contraseña123!");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDirectApi = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      setResult({
        status: response.status,
        data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Diagnóstico de Autenticación</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Credenciales</h2>

          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleDirectApi}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Probar API Directa
            </button>

            <button
              onClick={handleNextAuth}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Probar NextAuth
            </button>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Resultado</h2>

          {isLoading && <p>Cargando...</p>}

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-gray-100 rounded overflow-auto max-h-96">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-bold mb-2">Variables de entorno:</h3>
            <ul className="list-disc pl-5">
              <li>API_URL: {process.env.API_URL || "No definido"}</li>
              <li>
                NEXT_PUBLIC_API_URL:{" "}
                {process.env.NEXT_PUBLIC_API_URL || "No definido"}
              </li>
              <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || "No definido"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
