import { cache } from "react";

/**
 * Módulo de caché en memoria para desarrollo
 * En producción, esto se reemplazaría por Redis
 */

// Caché en memoria para desarrollo
const memoryCache = new Map<string, { value: any; expiry: number | null }>();

/**
 * Obtiene un valor de la caché
 */
export const getFromCache = cache(async <T>(key: string): Promise<T | null> => {
  try {
    // En el lado del cliente o cuando Redis no está disponible, usar caché en memoria
    const item = memoryCache.get(key);

    if (!item) return null;

    // Verificar si el item ha expirado
    if (item.expiry && item.expiry < Date.now()) {
      memoryCache.delete(key);
      return null;
    }

    return item.value as T;
  } catch (error) {
    console.error(`Error al obtener ${key} de caché:`, error);
    return null;
  }
});

/**
 * Guarda un valor en la caché con un tiempo de expiración opcional
 */
export const setInCache = async <T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<boolean> => {
  try {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    memoryCache.set(key, { value, expiry });
    return true;
  } catch (error) {
    console.error(`Error al guardar ${key} en caché:`, error);
    return false;
  }
};

/**
 * Elimina un valor de la caché
 */
export const removeFromCache = async (key: string): Promise<boolean> => {
  try {
    memoryCache.delete(key);
    return true;
  } catch (error) {
    console.error(`Error al eliminar ${key} de caché:`, error);
    return false;
  }
};

/**
 * Función de caché para datos de QuickBooks
 * Esta función es un stub para simular la función getRedisClient
 * pero utiliza la caché en memoria en su lugar
 */
export const getRedisClient = cache(async () => {
  console.log("Usando caché en memoria en lugar de Redis");

  // Devolvemos un objeto que simula la interfaz básica de Redis
  return {
    get: async (key: string) => {
      const data = await getFromCache(key);
      return data ? JSON.stringify(data) : null;
    },
    set: async (
      key: string,
      value: string,
      expiryMode?: string,
      expiry?: number
    ) => {
      if (expiryMode === "EX" && expiry) {
        await setInCache(key, JSON.parse(value), expiry);
      } else {
        await setInCache(key, JSON.parse(value));
      }
      return "OK";
    },
    del: async (key: string) => {
      await removeFromCache(key);
      return 1;
    },
  };
});
