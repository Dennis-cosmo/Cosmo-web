import { getSession } from "next-auth/react";

/**
 * Utilidad para hacer peticiones autenticadas a la API
 * @param endpoint - La URL del endpoint a la que hacer la petición (sin la base URL)
 * @param options - Opciones de fetch adicionales
 * @returns - La respuesta de la petición
 */
export async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Obtener la sesión del usuario para extraer el token
  const session = await getSession();

  // Configurar las opciones de la petición
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
      ...options.headers,
    },
  };

  // Realizar la petición
  try {
    const response = await fetch(url, fetchOptions);

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar obtener los detalles del error
      const errorData = await response.json().catch(() => ({
        message: "Error desconocido",
      }));

      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    return response;
  } catch (error) {
    console.error("Error en la petición a la API:", error);
    throw error;
  }
}

/**
 * Wrapper de fetchApi para peticiones GET
 */
export async function get<T>(endpoint: string): Promise<T> {
  const response = await fetchApi(endpoint);
  return response.json();
}

/**
 * Wrapper de fetchApi para peticiones POST
 */
export async function post<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetchApi(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Wrapper de fetchApi para peticiones PUT
 */
export async function put<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetchApi(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Wrapper de fetchApi para peticiones DELETE
 */
export async function del<T>(endpoint: string): Promise<T> {
  const response = await fetchApi(endpoint, {
    method: "DELETE",
  });
  return response.json();
}
