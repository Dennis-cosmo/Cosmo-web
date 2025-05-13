import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import {
  startSync,
  getSyncStatus,
} from "../../../../../lib/quickbooks/services/sync";
import { QuickBooksSyncPreferences } from "../../../../../lib/quickbooks/types";

/**
 * Ruta para obtener el estado de la sincronización
 * GET /api/integrations/quickbooks/sync
 */
export async function GET(request: Request) {
  try {
    // Verificar que el usuario está autenticado
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el estado actual de la sincronización
    const status = getSyncStatus();

    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Error al obtener estado de sincronización:", error);
    return NextResponse.json(
      { error: `Error al obtener estado: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Ruta para iniciar la sincronización con QuickBooks
 * POST /api/integrations/quickbooks/sync
 */
export async function POST(request: Request) {
  try {
    // Verificar que el usuario está autenticado
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener los datos de la solicitud
    const requestData = await request.json();
    const { companyId, preferences } = requestData;

    // Validar los datos recibidos
    if (!companyId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la empresa (companyId)" },
        { status: 400 }
      );
    }

    // Establece valores predeterminados para las preferencias si no se proporcionan
    const syncPreferences: QuickBooksSyncPreferences = {
      dataTypes: preferences?.dataTypes || ["expenses"],
      syncFrequency: preferences?.syncFrequency || "daily",
      importPeriod: preferences?.importPeriod || "1month",
    };

    // Iniciar la sincronización en segundo plano
    // Nota: Esto no esperará a que termine la sincronización antes de devolver la respuesta
    startSync(companyId, syncPreferences).catch((error) => {
      console.error("Error durante la sincronización en segundo plano:", error);
    });

    // Devolver una respuesta inmediata indicando que la sincronización ha comenzado
    return NextResponse.json({
      message: "Sincronización iniciada en segundo plano",
      status: "running",
    });
  } catch (error: any) {
    console.error("Error al iniciar sincronización:", error);
    return NextResponse.json(
      { error: `Error al iniciar sincronización: ${error.message}` },
      { status: 500 }
    );
  }
}
