import { NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  tokenService,
} from "../../../../../lib/quickbooks/services/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";

/**
 * Ruta para manejar el callback de autenticación de QuickBooks
 * GET /api/integrations/quickbooks/callback
 */
export async function GET(request: Request) {
  try {
    // Verificar que el usuario está autenticado
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el código de autorización y el companyId (realmId) de los parámetros
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const realmId = searchParams.get("realmId");
    const state = searchParams.get("state");

    // Verificar que se recibieron los parámetros necesarios
    if (!code) {
      throw new Error("No se recibió el código de autorización");
    }

    if (!realmId) {
      throw new Error("No se recibió el ID de la empresa (realmId)");
    }

    // Intercambiar el código por tokens de acceso
    const tokens = await exchangeCodeForTokens(code);

    // Guardar los tokens en la base de datos asociados al usuario y a la empresa
    await tokenService.saveTokens(tokens, realmId);

    // Redirigir al usuario a la página de éxito
    const successUrl = new URL("/integrations/quickbooks", request.url);
    successUrl.searchParams.set("status", "success");
    successUrl.searchParams.set("company", realmId);

    return NextResponse.redirect(successUrl.toString());
  } catch (error: any) {
    console.error("Error en callback de QuickBooks:", error);

    // Redirigir a una página de error
    const errorUrl = new URL("/integrations/quickbooks", request.url);
    errorUrl.searchParams.set("error", "callback_failed");
    errorUrl.searchParams.set("message", error.message);

    return NextResponse.redirect(errorUrl.toString());
  }
}
