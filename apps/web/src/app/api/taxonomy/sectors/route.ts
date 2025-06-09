import { NextResponse } from "next/server";
import axios from "axios";

// Datos estáticos de respaldo
const staticSectors = [
  { id: 21, name: "Construcción y actividades inmobiliarias" },
  { id: 4, name: "Energía" },
  { id: 2, name: "Protección y restauración medioambiental" },
  { id: 1, name: "Silvicultura" },
  { id: 8, name: "Información y comunicación" },
  { id: 3, name: "Manufactura" },
  { id: 9, name: "Actividades profesionales, científicas y técnicas" },
  { id: 6, name: "Transporte" },
  { id: 5, name: "Suministro de agua, saneamiento, gestión de residuos" },
];

export async function GET() {
  try {
    console.log("Obteniendo sectores de taxonomía desde nuestra API");

    // En Docker, usamos la variable API_INTERNAL_URL para contenedor api en entornos Docker
    const apiUrl = process.env.API_INTERNAL_URL || "http://localhost:4000";
    console.log("API URL para sectores:", apiUrl);

    try {
      // Obtener sectores desde nuestra API
      const sectorsResponse = await axios.get(`${apiUrl}/taxonomy/sectors`, {
        timeout: 5000,
      });

      // Verificar que la respuesta sea un array
      if (Array.isArray(sectorsResponse.data)) {
        console.log(
          `Sectores obtenidos del backend: ${sectorsResponse.data.length}`
        );

        // Devolver los datos al frontend
        return NextResponse.json(sectorsResponse.data);
      } else {
        console.error("Respuesta de API no es un array:", sectorsResponse.data);
        throw new Error("Formato de respuesta inválido");
      }
    } catch (apiError: any) {
      console.error(
        `Error específico al conectar con API (${apiUrl}):`,
        apiError.message
      );
      if (apiError.code === "ECONNREFUSED") {
        console.error(
          "No se pudo conectar al backend. Usando datos de respaldo."
        );
      }
      // Si falla, usamos datos estáticos de respaldo
      return NextResponse.json(staticSectors);
    }
  } catch (error) {
    console.error("Error general al obtener sectores de taxonomía:", error);
    // Si falla en cualquier punto, usamos datos de respaldo
    return NextResponse.json(staticSectors);
  }
}
