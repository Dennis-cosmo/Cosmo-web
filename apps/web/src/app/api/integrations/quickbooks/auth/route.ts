import { NextResponse } from "next/server";
import { generateAuthUrl } from "../../../../../lib/quickbooks/services/auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";

/**
 * Ruta para iniciar el proceso de autenticación con QuickBooks
 * GET /api/integrations/quickbooks/auth
 */
export async function GET(request: Request) {
  try {
    // Verificar que el usuario está autenticado
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Genera un estado único para prevenir ataques CSRF
    // En una implementación real, este estado debería guardarse en la base de datos
    // y asociarse con la sesión del usuario
    const state = Math.random().toString(36).substring(2, 15);

    // Obtener la URL de autorización
    const authUrl = generateAuthUrl(state);

    // Redirigir al usuario a la página de autorización de QuickBooks
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Error al iniciar autenticación con QuickBooks:", error);

    // Redirigir a una página de error
    const url = new URL("/integrations/quickbooks", request.url);
    url.searchParams.set("error", "auth_failed");

    return NextResponse.redirect(url.toString());
  }
}
