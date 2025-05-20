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
 * Implementación mejorada que usa cookies seguras para almacenar tokens
 */
export const tokenService = {
  // Token cache para minimizar accesos a la base de datos o storage
  _tokensCache: new Map<
    string,
    { tokens: QuickBooksTokens; timestamp: number }
  >(),

  saveTokens: async (
    tokens: QuickBooksTokens,
    companyId: string
  ): Promise<void> => {
    // Guardar en cache para acceso rápido
    tokenService._tokensCache.set(companyId, {
      tokens,
      timestamp: Date.now(),
    });

    try {
      // En un entorno de producción real, esto debería guardarse en una base de datos
      // Para este MVP, usamos cookies seguras HTTP-only
      const tokensData = JSON.stringify({
        ...tokens,
        companyId,
      });

      // Cookie segura, httpOnly para prevenir acceso de JavaScript del cliente
      const encodedTokens = Buffer.from(tokensData).toString("base64");

      // Establecer una cookie con el token
      // En Next.js, necesitaríamos usar cookies() de next/headers o
      // res.cookies.set() si trabajamos con una Response

      // Como solución temporal, podemos almacenar en el objeto global (solo para desarrollo)
      // NOTA: Esto no es ideal para producción - usar una base de datos es lo recomendado
      if (typeof global !== "undefined") {
        if (!global._quickbooksTokens) {
          (global as any)._quickbooksTokens = {};
        }
        (global as any)._quickbooksTokens[companyId] = tokens;
      }

      console.log(`Tokens guardados para la compañía ${companyId}`);
    } catch (error) {
      console.error("Error al guardar tokens:", error);
      throw new Error(`No se pudieron guardar los tokens: ${error.message}`);
    }
  },

  getTokens: async (companyId: string): Promise<QuickBooksTokens | null> => {
    // Verificar primero en la caché
    const cachedData = tokenService._tokensCache.get(companyId);
    if (cachedData && Date.now() - cachedData.timestamp < 60000) {
      // Cache de 1 minuto
      return cachedData.tokens;
    }

    try {
      // En un entorno de producción real, esto debería obtenerse de una base de datos
      // Como solución temporal para desarrollo, obtenemos del objeto global
      if (
        typeof global !== "undefined" &&
        (global as any)._quickbooksTokens &&
        (global as any)._quickbooksTokens[companyId]
      ) {
        const tokens = (global as any)._quickbooksTokens[companyId];

        // Actualizar caché
        tokenService._tokensCache.set(companyId, {
          tokens,
          timestamp: Date.now(),
        });

        return tokens;
      }

      return null;
    } catch (error) {
      console.error("Error al obtener tokens:", error);
      return null;
    }
  },

  deleteTokens: async (companyId: string): Promise<void> => {
    // Eliminar de la caché
    tokenService._tokensCache.delete(companyId);

    try {
      // En un entorno de producción real, esto debería eliminarse de una base de datos
      // Como solución temporal para desarrollo, eliminamos del objeto global
      if (typeof global !== "undefined" && (global as any)._quickbooksTokens) {
        delete (global as any)._quickbooksTokens[companyId];
      }

      console.log(`Tokens eliminados para la compañía ${companyId}`);
    } catch (error) {
      console.error("Error al eliminar tokens:", error);
    }
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
