import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    // Parsear el cuerpo de la solicitud
    const data = await request.json();

    // Validar datos básicos
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Redirigir la solicitud al backend
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Obtener la respuesta
    const responseData = await response.json();

    // Devolver la respuesta al cliente
    if (!response.ok) {
      console.error("Error del backend:", responseData);
      return NextResponse.json(
        { message: responseData.message || "Error en el registro" },
        { status: response.status }
      );
    }

    // Éxito
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error en el registro",
      },
      { status: 500 }
    );
  }
}
