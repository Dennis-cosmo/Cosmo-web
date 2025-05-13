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
