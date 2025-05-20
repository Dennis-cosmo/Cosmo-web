import { fetchExpenses } from "./expenses";
import { tokenService } from "./auth";
import { configService } from "./config";
import { QuickBooksExpense, QuickBooksSyncPreferences } from "../types";

// Estado de la sincronización (en memoria para MVP, en producción sería en base de datos)
const syncStatus = {
  isRunning: false,
  lastSyncTime: null as Date | null,
  companyId: null as string | null,
  error: null as string | null,
  progress: 0,
  totalItemsSynced: 0,
};

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

      // Aquí guardaríamos los gastos en nuestra base de datos
      // En un MVP podemos solo simular el guardado
      await saveExpensesToDatabase(expenses);
      console.log(`Sincronizados ${expenses.length} gastos desde QuickBooks`);

      // Podríamos agregar aquí más lógica para clasificar gastos, calcular métricas, etc.
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

/**
 * Guarda los gastos en la base de datos
 * Nota: Esta función es un placeholder. En una implementación real,
 * debería guardar los datos en tu base de datos.
 */
const saveExpensesToDatabase = async (
  expenses: QuickBooksExpense[]
): Promise<void> => {
  // En una implementación real, aquí insertaríamos o actualizaríamos
  // los gastos en la base de datos

  // Por ahora, simplemente simulamos el guardado
  console.log(`Guardando ${expenses.length} gastos en la base de datos`);

  // Simulamos un pequeño retraso para hacer la sincronización más realista
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Para cada gasto, podríamos almacenar en la base de datos
  for (const expense of expenses) {
    console.log(
      `Gasto sincronizado: ${expense.description} - ${expense.amount} ${expense.currency}`
    );
  }
};
