import { QuickBooksConfig, QuickBooksTokens } from "../types";

/**
 * Configuración para la integración con QuickBooks
 */

export const getQuickBooksConfig = (): QuickBooksConfig => {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Configuración de QuickBooks incompleta. Por favor, asegúrate de que QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET y QUICKBOOKS_REDIRECT_URI estén configurados en las variables de entorno."
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    environment: (process.env.QUICKBOOKS_ENVIRONMENT || "sandbox") as
      | "sandbox"
      | "production",
  };
};

/**
 * Genera una URL de autorización para QuickBooks
 */
export const generateAuthUrl = (state: string): string => {
  const config = getQuickBooksConfig();
  const baseUrl = "https://appcenter.intuit.com/connect/oauth2";

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    redirect_uri: config.redirectUri,
    state,
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Intercambia un código de autorización por tokens de acceso
 */
export const exchangeCodeForTokens = async (
  code: string
): Promise<QuickBooksTokens> => {
  const config = getQuickBooksConfig();
  const tokenEndpoint =
    "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
  });

  const authHeader = Buffer.from(
    `${config.clientId}:${config.clientSecret}`
  ).toString("base64");

  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error al obtener tokens: ${errorData.error} - ${errorData.error_description}`
      );
    }

    const data = await response.json();

    // Transformar la respuesta al formato de nuestro tipo QuickBooksTokens
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      refreshTokenExpiresIn: data.x_refresh_token_expires_in,
      tokenType: data.token_type,
      createdAt: Date.now(),
    };
  } catch (error: any) {
    console.error("Error intercambiando código por tokens:", error);
    throw new Error(`Error al obtener tokens: ${error.message}`);
  }
};

/**
 * Refresca un token de acceso expirado
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<QuickBooksTokens> => {
  const config = getQuickBooksConfig();
  const tokenEndpoint =
    "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const authHeader = Buffer.from(
    `${config.clientId}:${config.clientSecret}`
  ).toString("base64");

  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error al refrescar token: ${errorData.error} - ${errorData.error_description}`
      );
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      refreshTokenExpiresIn: data.x_refresh_token_expires_in,
      tokenType: data.token_type,
      createdAt: Date.now(),
    };
  } catch (error: any) {
    console.error("Error refrescando token:", error);
    throw new Error(`Error al refrescar token: ${error.message}`);
  }
};

/**
 * Servicio para manejar el almacenamiento de tokens
 * Nota: En una implementación real, estos métodos deberían almacenar los tokens en una base de datos
 */
export const tokenService = {
  // Almacena temporalmente los tokens (en memoria)
  // En producción, estos deberían guardarse en una base de datos
  _tokens: null as QuickBooksTokens | null,

  saveTokens: async (
    tokens: QuickBooksTokens,
    companyId: string
  ): Promise<void> => {
    // En una implementación real, guardaríamos en la base de datos asociado al usuario y companyId
    tokenService._tokens = tokens;
    console.log(`Tokens guardados para la compañía ${companyId}`);
  },

  getTokens: async (companyId: string): Promise<QuickBooksTokens | null> => {
    // En una implementación real, obtendríamos de la base de datos
    return tokenService._tokens;
  },

  deleteTokens: async (companyId: string): Promise<void> => {
    // En una implementación real, eliminaríamos de la base de datos
    tokenService._tokens = null;
    console.log(`Tokens eliminados para la compañía ${companyId}`);
  },
};

/**
 * Comprueba si un token de acceso está expirado y lo refresca si es necesario
 */
export const ensureValidAccessToken = async (
  companyId: string
): Promise<string | null> => {
  const tokens = await tokenService.getTokens(companyId);

  if (!tokens) {
    return null;
  }

  const expirationTime = tokens.createdAt + tokens.expiresIn * 1000;
  const isExpired = Date.now() >= expirationTime - 60000; // 1 minuto antes de expirar

  if (isExpired) {
    try {
      const newTokens = await refreshAccessToken(tokens.refreshToken);
      await tokenService.saveTokens(newTokens, companyId);
      return newTokens.accessToken;
    } catch (error) {
      console.error("Error al refrescar token:", error);
      return null;
    }
  }

  return tokens.accessToken;
};
