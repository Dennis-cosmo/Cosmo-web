import { fetchExpenses } from "./expenses";
import { tokenService } from "./auth";
import { configService } from "./config";
import { QuickBooksExpense, QuickBooksSyncPreferences } from "../types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { getRedisClient, getFromCache, setInCache } from "../../../lib/redis";

// Estado de la sincronización (en memoria para MVP, en producción sería en base de datos)
const syncStatus = {
  isRunning: false,
  lastSyncTime: null as Date | null,
  companyId: null as string | null,
  error: null as string | null,
  progress: 0,
  totalItemsSynced: 0,
};

// Caché en memoria para almacenar temporalmente los gastos sincronizados
// Esto evita guardar datos sensibles en la base de datos
const expensesMemoryCache = new Map<string, QuickBooksExpense[]>();

/**
 * Calcula la fecha de inicio para la sincronización basada en las preferencias
 */
const getStartDateFromPreferences = (
  preferences: QuickBooksSyncPreferences
): string => {
  const now = new Date();
  let startDate = new Date();

  switch (preferences.importPeriod) {
    case "1month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "3months":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "6months":
      startDate.setMonth(now.getMonth() - 6);
      break;
    case "1year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      // No establecemos fecha límite para traer todo
      return "";
  }

  return startDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
};

/**
 * Guarda los gastos en caché para acceso rápido durante la sesión
 * Esta función almacena datos tanto en la caché en memoria como
 * en la implementación de caché Redis/memoria de la aplicación
 */
const cacheExpenses = async (
  userId: string,
  companyId: string,
  expenses: QuickBooksExpense[]
): Promise<void> => {
  try {
    // Clave única para este usuario/compañía
    const cacheKey = `expenses:${userId}:${companyId}`;

    // Guardar en caché de memoria dedicada para QuickBooks
    expensesMemoryCache.set(cacheKey, expenses);

    // Obtener cliente Redis (o la implementación de caché actual)
    const redis = await getRedisClient();
    if (!redis) {
      console.warn("Redis no está disponible, usando solo caché en memoria");

      // Si Redis no está disponible, aseguramos que se guarde en la caché en memoria general
      await setInCache(cacheKey, expenses, 86400); // TTL de 24 horas (86400 segundos)
      return;
    }

    // Extraer solo los datos esenciales para nuestra aplicación
    const essentialData = expenses.map((e) => ({
      id: e.id,
      amount: e.amount,
      date: e.date,
      description: e.description,
      vendor: e.vendor,
      category: e.category,
      sourceId: e.sourceId || e.id,
      sourceSystem: "quickbooks",
      metadata: {
        syncDate: new Date().toISOString(),
        source: "quickbooks",
      },
    }));

    // Guardar en Redis con TTL de 24 horas (86400 segundos)
    await redis.set(cacheKey, JSON.stringify(essentialData), "EX", 86400);

    // También guardar una versión con los IDs para verificación rápida
    const idMap = expenses.reduce((acc, e) => {
      acc[e.id] = true;
      return acc;
    }, {});
    await redis.set(`${cacheKey}:ids`, JSON.stringify(idMap), "EX", 86400);

    console.log(`Cacheados ${expenses.length} gastos para acceso rápido`);
  } catch (error) {
    console.error("Error al cachear gastos:", error);
    // No lanzamos error para que no afecte el flujo principal
  }
};

/**
 * Obtiene los gastos cacheados para un usuario/compañía
 */
export const getCachedExpenses = async (
  userId: string,
  companyId: string
): Promise<QuickBooksExpense[]> => {
  try {
    const cacheKey = `expenses:${userId}:${companyId}`;

    // Primero intentamos obtener de la caché en memoria dedicada (más rápido)
    const memoryExpenses = expensesMemoryCache.get(cacheKey);
    if (memoryExpenses && memoryExpenses.length > 0) {
      console.log(
        `Obtenidos ${memoryExpenses.length} gastos de caché en memoria`
      );
      return memoryExpenses;
    }

    // Si no está en memoria, intentamos obtenerlo de Redis/caché general
    const redis = await getRedisClient();
    if (redis) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const expenses = JSON.parse(cachedData);
        console.log(`Obtenidos ${expenses.length} gastos de caché Redis`);

        // Actualizar la caché en memoria para futuras consultas
        expensesMemoryCache.set(cacheKey, expenses);

        return expenses;
      }
    } else {
      // Intentar obtener de la caché en memoria general
      const expenses = await getFromCache<QuickBooksExpense[]>(cacheKey);
      if (expenses && expenses.length > 0) {
        console.log(
          `Obtenidos ${expenses.length} gastos de caché en memoria general`
        );
        return expenses;
      }
    }

    console.log("No se encontraron gastos en caché");
    return [];
  } catch (error) {
    console.error("Error al obtener gastos de caché:", error);
    return [];
  }
};

/**
 * Inicia la sincronización de datos con QuickBooks
 */
export const startSync = async (
  companyId: string,
  preferences: QuickBooksSyncPreferences
): Promise<void> => {
  // Evita iniciar una sincronización si ya hay una en curso
  if (syncStatus.isRunning) {
    throw new Error("Ya hay una sincronización en curso");
  }

  // Obtener la sesión actual para el userId
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("No se pudo obtener la sesión del usuario");
  }
  const userId = session.user.id;

  // Verifica que tengamos tokens válidos para este companyId
  const tokens = await tokenService.getTokens(companyId);

  console.log(
    `Iniciando sincronización para compañía ${companyId}. Tokens disponibles: ${tokens ? "Sí" : "No"}`
  );

  if (!tokens) {
    syncStatus.error =
      "No hay tokens de acceso disponibles. Debe autenticar la aplicación primero.";
    throw new Error(syncStatus.error);
  }

  // Guardar el inicio de la sincronización para medir duración
  const syncStartTime = Date.now();
  const syncStats: Record<string, number> = {};

  try {
    // Actualiza el estado de sincronización
    syncStatus.isRunning = true;
    syncStatus.companyId = companyId;
    syncStatus.error = null;
    syncStatus.progress = 0;
    syncStatus.totalItemsSynced = 0;

    // Obtener la fecha de inicio según las preferencias
    const startDate = getStartDateFromPreferences(preferences);
    console.log(
      `Sincronizando datos desde: ${startDate || "todos los tiempos"}`
    );

    // Lista para almacenar todos los gastos sincronizados
    const allExpenses: QuickBooksExpense[] = [];

    // Sincronizar los tipos de datos seleccionados
    if (preferences.dataTypes.includes("expenses")) {
      syncStatus.progress = 20;
      console.log("Obteniendo gastos de QuickBooks...");

      // Obtener los gastos desde QuickBooks
      const expenses = await fetchExpenses(companyId, startDate);
      allExpenses.push(...expenses);
      syncStatus.progress = 50; // Actualizar progreso
      syncStatus.totalItemsSynced += expenses.length;
      syncStats["expenses"] = expenses.length;

      // Cachear los gastos para acceso rápido sin guardarlos en base de datos
      await cacheExpenses(userId, companyId, expenses);

      // Registrar la sincronización en el backend sin guardar datos sensibles
      if (expenses.length > 0) {
        await notifyBackendOfSync(expenses.length, "quickbooks");
      }

      console.log(`Sincronizados ${expenses.length} gastos desde QuickBooks`);
    }

    // Implementación futura:
    // Si se incluyen facturas
    if (preferences.dataTypes.includes("invoices")) {
      // En el futuro implementaremos esta función
      // const invoices = await fetchInvoices(companyId, startDate);
      // syncStatus.totalItemsSynced += invoices.length;
      // syncStats["invoices"] = invoices.length;
    }

    // Si se incluyen proveedores
    if (preferences.dataTypes.includes("vendors")) {
      // En el futuro implementaremos esta función
      // const vendors = await fetchVendors(companyId);
      // syncStatus.totalItemsSynced += vendors.length;
      // syncStats["vendors"] = vendors.length;
    }

    // Actualizar el estado final de la sincronización
    syncStatus.isRunning = false;
    const now = new Date();
    syncStatus.lastSyncTime = now;
    syncStatus.progress = 100;

    // Calcular duración de la sincronización
    const syncDuration = Date.now() - syncStartTime;

    // Guardar la configuración y actualizar estadísticas
    await configService.saveConfig(companyId, preferences, now);
    await configService.updateSyncStats(companyId, syncDuration, syncStats);

    // Guardar en sessionStorage que se ha realizado la sincronización
    if (typeof window !== "undefined") {
      const nowStr = new Date().toISOString();
      sessionStorage.setItem("lastQuickBooksSyncTime", nowStr);
      sessionStorage.setItem(
        "lastQuickBooksSyncCount",
        String(allExpenses.length)
      );
    }

    return;
  } catch (error: any) {
    // Actualizar el estado en caso de error
    syncStatus.isRunning = false;
    syncStatus.error = error.message;
    syncStatus.progress = 0;

    console.error("Error durante la sincronización:", error);
    throw error;
  }
};

/**
 * Notifica al backend sobre la sincronización sin enviar datos sensibles
 * Utiliza el nuevo endpoint sync-memory que solo registra la acción
 */
const notifyBackendOfSync = async (
  expensesCount: number,
  sourceSystem: string
): Promise<void> => {
  try {
    // Obtener la sesión actual
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      throw new Error("No hay token de acceso disponible");
    }

    // Solo enviar la cantidad de gastos y el sistema de origen
    // sin incluir los datos sensibles
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/expenses/sync-memory`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          expenses: new Array(expensesCount).fill({}), // Array vacío del tamaño correcto
          sourceSystem,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error al notificar sincronización: ${errorData.message || "Error desconocido"}`
      );
    }

    const result = await response.json();
    console.log(
      `Notificación de sincronización exitosa para ${result.count} gastos`
    );
  } catch (error) {
    console.error("Error al notificar sincronización al backend:", error);
    // No lanzamos el error para que no afecte el flujo principal
    // ya que los datos ya están en caché de memoria
  }
};

/**
 * Obtiene el estado actual de la sincronización
 */
export const getSyncStatus = async (companyId?: string) => {
  // Si se proporciona un companyId, obtenemos también la configuración guardada
  if (companyId) {
    const config = await configService.getConfig(companyId);
    const shouldSync = await configService.shouldSync(companyId);
    const timeUntilNextSync =
      await configService.getTimeUntilNextSync(companyId);

    return {
      ...syncStatus,
      savedConfig: config,
      shouldSync,
      timeUntilNextSync,
    };
  }

  return { ...syncStatus };
};
