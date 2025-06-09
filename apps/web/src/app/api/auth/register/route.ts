import { NextResponse } from "next/server";

// API URL para el servicio de autenticación
// En el servidor usamos la URL interna (API_INTERNAL_URL) si está disponible
const API_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Registro de usuario - proxy a API:", API_URL);

    // Enviar la petición al backend real
    const apiResponse = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Obtener la respuesta del backend
    const responseData = await apiResponse.json();

    // Si la respuesta no es ok, devolver error
    if (!apiResponse.ok) {
      console.error("Error en el registro (API):", responseData);
      return NextResponse.json(
        { message: responseData.message || "Error en el registro" },
        { status: apiResponse.status }
      );
    }

    // Devolver la respuesta exitosa
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error en el proxy de registro:", error);
    return NextResponse.json(
      { message: "Error en el procesamiento del registro" },
      { status: 500 }
    );
  }
}
