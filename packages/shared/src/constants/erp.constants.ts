import { ERPAuthConfig, ERPType } from '../types';

export const ERP_PROVIDERS: Record<ERPType, string> = {
  quickbooks: 'QuickBooks',
  sap: 'SAP',
  oracle: 'Oracle',
  sage: 'Sage',
  netsuite: 'NetSuite',
  xero: 'Xero',
  microsoft_dynamics: 'Microsoft Dynamics',
};

export const ERP_AUTH_CONFIGS: Record<ERPType, Partial<ERPAuthConfig>> = {
  quickbooks: {
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    scope: 'com.intuit.quickbooks.accounting',
  },
  sap: {
    authUrl: 'https://my-sap-instance.com/oauth2/authorize',
    tokenUrl: 'https://my-sap-instance.com/oauth2/token',
    scope: 'read write',
  },
  oracle: {
    authUrl: 'https://login.oracle.com/oauth2/authorize',
    tokenUrl: 'https://login.oracle.com/oauth2/token',
    scope: 'erp',
  },
  sage: {
    authUrl: 'https://www.sageone.com/oauth2/auth',
    tokenUrl: 'https://www.sageone.com/oauth2/token',
    scope: 'full_access',
  },
  netsuite: {
    authUrl: 'https://system.netsuite.com/app/login/oauth2/authorize.nl',
    tokenUrl: 'https://system.netsuite.com/app/login/oauth2/token.nl',
    scope: 'restlets',
  },
  xero: {
    authUrl: 'https://login.xero.com/identity/connect/authorize',
    tokenUrl: 'https://identity.xero.com/connect/token',
    scope: 'accounting.transactions accounting.settings',
  },
  microsoft_dynamics: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/token',
    scope: 'https://api.businesscentral.dynamics.com/.default',
  },
}; 