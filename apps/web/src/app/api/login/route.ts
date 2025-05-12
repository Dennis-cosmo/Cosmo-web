import { NextResponse } from "next/server";

// Usamos directamente la URL de la API para evitar problemas con variables de entorno
const API_URL = "http://localhost:4000";

export async function POST(request: Request) {
  try {
    // Extrae los datos de la petición
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Credenciales incompletas" },
        { status: 400 }
      );
    }

    // Reenvía la petición al backend
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Leer el texto de la respuesta
    const responseText = await response.text();

    // Intentar parsear la respuesta como JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Error al procesar la respuesta del servidor",
          details: responseText,
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      // Si la respuesta no es exitosa, devolvemos el error
      return NextResponse.json(
        {
          error: "Error de autenticación",
          details: data,
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Verificamos que los datos tengan el formato esperado
    if (!data.accessToken || !data.user) {
      return NextResponse.json(
        {
          error: "Formato de respuesta inesperado",
          details: data,
        },
        { status: 500 }
      );
    }

    // Devolvemos los datos al cliente
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error en el servidor",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
