import {
  QuickBooksSyncPreferences,
  QuickBooksSavedConfig,
  calculateNextSyncTime,
} from "../types";

// Objeto para almacenar la configuración en memoria (en producción sería una base de datos)
let savedConfigs: Record<string, QuickBooksSavedConfig> = {};

// Similar al patrón utilizado en tokenService, almacenamos también en el objeto global para
// que persista entre reinicios del servidor en desarrollo
if (typeof global !== "undefined") {
  if (!(global as any)._quickbooksConfigs) {
    (global as any)._quickbooksConfigs = {};
  }
  savedConfigs = (global as any)._quickbooksConfigs;
}

/**
 * Servicio para gestionar la configuración de la sincronización de QuickBooks
 */
export const configService = {
  /**
   * Guarda o actualiza la configuración para una empresa
   */
  saveConfig: async (
    companyId: string,
    preferences: QuickBooksSyncPreferences,
    lastSyncTime?: Date | null
  ): Promise<QuickBooksSavedConfig> => {
    const now = new Date();
    const existingConfig = savedConfigs[companyId];

    // Calculamos la próxima sincronización según la frecuencia elegida
    const nextSyncTime = lastSyncTime
      ? calculateNextSyncTime(lastSyncTime, preferences.syncFrequency)
      : null;

    // Si hay configuración existente, actualizamos solo los campos necesarios
    // Si no hay, creamos una nueva
    const updatedConfig: QuickBooksSavedConfig = existingConfig
      ? {
          ...existingConfig,
          preferences,
          lastSyncTime: lastSyncTime || existingConfig.lastSyncTime,
          nextSyncTime,
          updatedAt: now,
        }
      : {
          companyId,
          preferences,
          lastSyncTime: lastSyncTime || null,
          nextSyncTime,
          syncStats: {
            totalItemsSynced: 0,
            lastSyncDuration: 0,
            itemsByType: {},
          },
          createdAt: now,
          updatedAt: now,
        };

    // Guardar config en memoria
    savedConfigs[companyId] = updatedConfig;

    // Guardar en global para persistencia entre reinicios (dev only)
    if (typeof global !== "undefined") {
      (global as any)._quickbooksConfigs[companyId] = updatedConfig;
    }

    console.log(`Configuración guardada para empresa ${companyId}`);
    return updatedConfig;
  },

  /**
   * Obtiene la configuración guardada para una empresa
   */
  getConfig: async (
    companyId: string
  ): Promise<QuickBooksSavedConfig | null> => {
    return savedConfigs[companyId] || null;
  },

  /**
   * Actualiza las estadísticas de sincronización
   */
  updateSyncStats: async (
    companyId: string,
    duration: number,
    itemsByType: Record<string, number>
  ): Promise<void> => {
    const config = savedConfigs[companyId];
    if (!config) return;

    const totalItems = Object.values(itemsByType).reduce(
      (sum, count) => sum + count,
      0
    );

    config.syncStats = {
      totalItemsSynced: totalItems,
      lastSyncDuration: duration,
      itemsByType,
    };

    config.updatedAt = new Date();

    // Actualizar en global para persistencia
    if (typeof global !== "undefined" && (global as any)._quickbooksConfigs) {
      (global as any)._quickbooksConfigs[companyId] = config;
    }
  },

  /**
   * Comprueba si es necesario sincronizar según la configuración guardada
   */
  shouldSync: async (companyId: string): Promise<boolean> => {
    const config = savedConfigs[companyId];
    if (!config || !config.nextSyncTime) return true;

    const now = new Date();
    return now >= config.nextSyncTime;
  },

  /**
   * Obtiene el tiempo restante hasta la próxima sincronización
   * @returns Tiempo en milisegundos, o 0 si ya es tiempo de sincronizar
   */
  getTimeUntilNextSync: async (companyId: string): Promise<number> => {
    const config = savedConfigs[companyId];
    if (!config || !config.nextSyncTime) return 0;

    const now = new Date();
    const diff = config.nextSyncTime.getTime() - now.getTime();

    return Math.max(0, diff);
  },
};
