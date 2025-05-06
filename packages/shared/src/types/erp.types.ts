export type ERPType = 'quickbooks' | 'sap' | 'oracle' | 'sage' | 'netsuite' | 'xero' | 'microsoft_dynamics';

export interface ERPConnection {
  id: string;
  userId: string;
  provider: ERPType;
  status: ERPConnectionStatus;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  metadata?: Record<string, any>;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ERPConnectionStatus = 'active' | 'expired' | 'disconnected' | 'error';

export interface ERPConnectionCreateDTO {
  provider: ERPType;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  metadata?: Record<string, any>;
}

export interface ERPConnectionUpdateDTO {
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  status?: ERPConnectionStatus;
  metadata?: Record<string, any>;
}

export interface ERPSyncOptions {
  startDate?: Date;
  endDate?: Date;
  includeExpenses?: boolean;
  includeInvoices?: boolean;
  includeContacts?: boolean;
  limitResults?: number;
}

export interface ERPAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
} 