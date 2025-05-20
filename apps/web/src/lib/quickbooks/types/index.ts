/**
 * Tipos de datos para la integración con QuickBooks
 */

export interface QuickBooksTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
  tokenType: string;
  createdAt: number;
}

export interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: "sandbox" | "production";
}

export interface QuickBooksIntegrationStatus {
  connected: boolean;
  lastSyncTime?: Date;
  companyId?: string;
  companyName?: string;
  error?: string;
}

export interface QuickBooksExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category?: string;
  supplier?: string;
  notes?: string;
  paymentMethod?: string;
  sourceId: string;
  sourceSystem: "quickbooks";
  rawData?: any;
}

export interface QuickBooksSyncPreferences {
  dataTypes: ("expenses" | "invoices" | "vendors")[];
  syncFrequency: "daily" | "12hours" | "6hours" | "hourly";
  importPeriod: "1month" | "3months" | "6months" | "1year" | "all";
}

/**
 * Configuración guardada con información adicional sobre la sincronización
 */
export interface QuickBooksSavedConfig {
  companyId: string;
  preferences: QuickBooksSyncPreferences;
  lastSyncTime: Date | null;
  nextSyncTime: Date | null;
  syncStats: {
    totalItemsSynced: number;
    lastSyncDuration: number; // en milisegundos
    itemsByType: Record<string, number>; // ej: { "expenses": 10, "invoices": 5 }
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calcula la siguiente fecha de sincronización basada en la frecuencia configurada
 */
export function calculateNextSyncTime(
  lastSyncTime: Date,
  frequency: QuickBooksSyncPreferences["syncFrequency"]
): Date {
  const nextSync = new Date(lastSyncTime);

  switch (frequency) {
    case "hourly":
      nextSync.setHours(nextSync.getHours() + 1);
      break;
    case "6hours":
      nextSync.setHours(nextSync.getHours() + 6);
      break;
    case "12hours":
      nextSync.setHours(nextSync.getHours() + 12);
      break;
    case "daily":
    default:
      nextSync.setDate(nextSync.getDate() + 1);
      break;
  }

  return nextSync;
}
