import { fetchExpenses } from "./expenses";
import { tokenService } from "./auth";
import { QuickBooksExpense, QuickBooksSyncPreferences } from "../types";

// Estado de la sincronización (en memoria para MVP, en producción sería en base de datos)
const syncStatus = {
  isRunning: false,
  lastSyncTime: null as Date | null,
  companyId: null as string | null,
  error: null as string | null,
  progress: 0,
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
  if (!tokens) {
    throw new Error(
      "No hay tokens de acceso disponibles. Debe autenticar la aplicación primero."
    );
  }

  try {
    // Actualiza el estado de sincronización
    syncStatus.isRunning = true;
    syncStatus.companyId = companyId;
    syncStatus.error = null;
    syncStatus.progress = 0;

    // Obtener la fecha de inicio según las preferencias
    const startDate = getStartDateFromPreferences(preferences);

    // Lista para almacenar todos los gastos sincronizados
    const allExpenses: QuickBooksExpense[] = [];

    // Sincronizar los tipos de datos seleccionados
    if (preferences.dataTypes.includes("expenses")) {
      // Obtener los gastos desde QuickBooks
      const expenses = await fetchExpenses(companyId, startDate);
      allExpenses.push(...expenses);
      syncStatus.progress = 50; // Actualizar progreso

      // Aquí guardaríamos los gastos en nuestra base de datos
      // En un MVP podemos solo simular el guardado
      console.log(`Sincronizados ${expenses.length} gastos desde QuickBooks`);

      // Podríamos agregar aquí más lógica para clasificar gastos, calcular métricas, etc.
    }

    // Otros tipos de datos (facturas, proveedores, etc.) se implementarían de manera similar

    // Actualizar el estado final de la sincronización
    syncStatus.isRunning = false;
    syncStatus.lastSyncTime = new Date();
    syncStatus.progress = 100;

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
export const getSyncStatus = () => {
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
};
