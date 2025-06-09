import { NextResponse } from "next/server";
import axios from "axios";

// Datos estáticos de respaldo
const staticActivities = [
  // Energía
  {
    id: 401,
    name: "Generación de electricidad mediante tecnología solar fotovoltaica",
    sectorId: 4,
    sectorName: "Energía",
    naceCodes: ["D35.11"],
  },
  {
    id: 402,
    name: "Generación de electricidad mediante tecnología solar concentrada",
    sectorId: 4,
    sectorName: "Energía",
    naceCodes: ["D35.11"],
  },
  // Manufactura
  {
    id: 301,
    name: "Fabricación de tecnologías bajas en carbono",
    sectorId: 3,
    sectorName: "Manufactura",
    naceCodes: ["C25", "C27", "C28"],
  },
  // Transporte
  {
    id: 601,
    name: "Transporte por ferrocarril de pasajeros",
    sectorId: 6,
    sectorName: "Transporte",
    naceCodes: ["H49.10"],
  },
];

export async function GET() {
  try {
    console.log("Obteniendo actividades de taxonomía desde nuestra API");

    // Obtener actividades desde nuestra API
    // En Docker, usamos la variable API_INTERNAL_URL para contenedor api en entornos Docker
    const apiUrl = process.env.API_INTERNAL_URL || "http://localhost:4000";
    console.log("API URL para actividades:", apiUrl);

    try {
      const activitiesResponse = await axios.get(
        `${apiUrl}/taxonomy/activities/all`,
        { timeout: 8000 }
      );

      // Verificar que la respuesta sea un array
      if (Array.isArray(activitiesResponse.data)) {
        console.log(
          `Actividades obtenidas del backend: ${activitiesResponse.data.length}`
        );

        // Procesar las actividades para asegurar formato consistente
        const processedActivities = activitiesResponse.data.map((item: any) => {
          // Extraer datos del sector
          const sectorData = item.sector || {};

          return {
            id: item.id,
            name: item.name || "Actividad sin nombre",
            sectorId: item.sectorId || sectorData.id || 0,
            sectorName: sectorData.name || "Sector desconocido",
            naceCodes: item.naceCodes || [],
            description: item.description || "",
          };
        });

        // Devolver los datos procesados al frontend
        return NextResponse.json(processedActivities);
      } else {
        console.error(
          "Respuesta de API no es un array:",
          activitiesResponse.data
        );
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
      // Si falla, usamos datos de respaldo
      return NextResponse.json(staticActivities);
    }
  } catch (error) {
    console.error("Error general al obtener actividades de taxonomía:", error);
    // Si falla, usamos datos de respaldo
    return NextResponse.json(staticActivities);
  }
}
