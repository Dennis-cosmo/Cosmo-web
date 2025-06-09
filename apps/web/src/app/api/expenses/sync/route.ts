import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

// Marcar como ruta dinámica para evitar pre-renderizado estático
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint para sincronizar gastos con la API del backend
 * POST /api/expenses/sync
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
    const { expenses, sourceSystem } = requestData;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de gastos no vacío" },
        { status: 400 }
      );
    }

    // Enviar los datos al backend
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/expenses/sync`;
    console.log(`Enviando petición a: ${apiUrl}`);

    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        expenses,
        sourceSystem: sourceSystem || "quickbooks",
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error("Error desde el backend:", errorData);
      return NextResponse.json(
        {
          error: `Error del servidor: ${errorData.message || errorData.error || "Error desconocido"}`,
        },
        { status: backendResponse.status }
      );
    }

    // Devolver la respuesta del backend
    const responseData = await backendResponse.json();
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error en la sincronización de gastos:", error);
    return NextResponse.json(
      { error: `Error en la sincronización: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para obtener gastos sincronizados
 * GET /api/expenses/sync
 */
export async function GET(request: Request) {
  try {
    // Verificar que el usuario está autenticado
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener gastos del backend
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/expenses`;

    const backendResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error("Error al obtener gastos:", errorData);
      return NextResponse.json(
        { error: "Error al obtener gastos del backend" },
        { status: backendResponse.status }
      );
    }

    // Devolver los gastos
    const expenses = await backendResponse.json();
    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("Error al obtener gastos:", error);
    return NextResponse.json(
      { error: `Error al obtener gastos: ${error.message}` },
      { status: 500 }
    );
  }
}
