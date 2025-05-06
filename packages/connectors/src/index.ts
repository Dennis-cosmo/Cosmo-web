// Tipos para conectores
export type ConnectorType =
  | "sap"
  | "quickbooks"
  | "xero"
  | "oracle"
  | "dynamics"
  | "custom";

// Interfaces para conectores
export interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  url: string;
  apiKey?: string;
  isActive: boolean;
  config: Record<string, any>;
}

// Constantes para conectores
export const CONNECTOR_TYPES = {
  SAP: "sap" as ConnectorType,
  QUICKBOOKS: "quickbooks" as ConnectorType,
  XERO: "xero" as ConnectorType,
  ORACLE: "oracle" as ConnectorType,
  DYNAMICS: "dynamics" as ConnectorType,
  CUSTOM: "custom" as ConnectorType,
};

// Funciones de ayuda para conectores
export function getConnectorLabel(type: ConnectorType): string {
  switch (type) {
    case CONNECTOR_TYPES.SAP:
      return "SAP";
    case CONNECTOR_TYPES.QUICKBOOKS:
      return "QuickBooks";
    case CONNECTOR_TYPES.XERO:
      return "Xero";
    case CONNECTOR_TYPES.ORACLE:
      return "Oracle";
    case CONNECTOR_TYPES.DYNAMICS:
      return "Dynamics 365";
    case CONNECTOR_TYPES.CUSTOM:
      return "Custom";
    default:
      return "Unknown";
  }
}
