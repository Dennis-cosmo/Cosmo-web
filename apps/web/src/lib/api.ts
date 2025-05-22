import { getSession } from "next-auth/react";

// Constantes para configuración de API
const API_CONFIG = {
  // Cuando estamos en el navegador, usamos la URL relativa para que haga la petición al mismo dominio
  // Pero excluimos las rutas de NextAuth que necesitan seguir siendo manejadas por Next.js
  baseUrl:
    typeof window !== "undefined"
      ? "/api" // URL relativa para peticiones desde el navegador
      : "http://api:4000", // URL para peticiones desde el servidor (dentro del contenedor)
  defaultTimeout: 30000,
  retryCount: 1,
};

/**
 * Clase ApiError para errores específicos de la API
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data: any;

  constructor(status: number, statusText: string, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Verifica si una URL es una ruta de NextAuth que debe ser manejada por Next.js
 * @param url - La URL a verificar
 * @returns - true si la URL es una ruta de NextAuth
 */
function isNextAuthUrl(url: string): boolean {
  return url.includes("/api/auth/");
}

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
  // Si es una ruta de NextAuth, usamos la URL relativa directamente
  if (isNextAuthUrl(endpoint)) {
    console.log(`Petición a ruta de NextAuth: ${endpoint}`);
    return fetch(endpoint, options);
  }

  const baseUrl = API_CONFIG.baseUrl;
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  console.log(`Realizando petición a API: ${url}`);

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

  // Configurar timeout para la petición
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    API_CONFIG.defaultTimeout
  );
  fetchOptions.signal = controller.signal;

  // Realizar la petición con reintento en caso de error de red
  let response: Response | null = null;
  let lastError: any = null;
  let retryCount = API_CONFIG.retryCount;

  while (retryCount >= 0) {
    try {
      response = await fetch(url, fetchOptions);
      break;
    } catch (error) {
      lastError = error;
      retryCount--;

      // Si se acabaron los reintentos o no es error de red, no reintentamos
      if (
        retryCount < 0 ||
        (error instanceof Error && error.name !== "TypeError")
      ) {
        break;
      }

      // Esperar antes de reintentar (backoff exponencial)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (API_CONFIG.retryCount - retryCount))
      );
    }
  }

  // Limpiar el timeout
  clearTimeout(timeoutId);

  // Si hay un error y no se obtuvo respuesta, lanzar error
  if (!response) {
    console.error(`Error de red en la petición a: ${url}`, lastError);
    throw new ApiError(
      0,
      "Network Error",
      "Error de conexión con el servidor",
      lastError
    );
  }

  // Si la respuesta no es exitosa, lanzar un error
  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error(`Error en la petición a: ${url}`, {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      throw new ApiError(
        response.status,
        response.statusText,
        errorData.message || `Error ${response.status}: ${response.statusText}`,
        errorData
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;

      console.error(`Error al procesar la respuesta de error: ${url}`, error);
      throw new ApiError(
        response.status,
        response.statusText,
        `Error ${response.status}: ${response.statusText}`,
        null
      );
    }
  }

  return response;
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
