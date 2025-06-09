import { NextResponse } from "next/server";
import axios from "axios";
import { type NextRequest } from "next/server";

// Datos de fallback para cuando la API falla
const fallbackActivities = [
  {
    id: 401,
    name: "Generación de electricidad mediante tecnología solar fotovoltaica",
    sectorId: 4,
    naceCodes: ["D35.11"],
  },
  {
    id: 301,
    name: "Fabricación de tecnologías bajas en carbono",
    sectorId: 3,
    naceCodes: ["C25", "C27", "C28"],
  },
  {
    id: 601,
    name: "Transporte por ferrocarril de pasajeros",
    sectorId: 6,
    naceCodes: ["H49.10"],
  },
];

export async function GET(request: NextRequest) {
  try {
    // Obtener el query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { message: "Query parameter is required" },
        { status: 400 }
      );
    }

    console.log(`Buscando actividades con query: ${query}`);

    // Llamar al endpoint de búsqueda de la API externa
    const response = await axios.get(
      `https://webgate.ec.europa.eu/sft/api/v1/en/activities/search?query=${encodeURIComponent(query)}`
    );

    // Procesar las actividades para adaptarlas a nuestra estructura
    const processedActivities = response.data.map((item: any) => {
      const activityData = item.activity || item;
      const sectorData = activityData.sector || {};

      // Extraer códigos NACE
      let naceCodes: string[] = [];
      if (item.naceCodes && Array.isArray(item.naceCodes)) {
        naceCodes = item.naceCodes;
      } else if (
        activityData.naceCodes &&
        Array.isArray(activityData.naceCodes)
      ) {
        naceCodes = activityData.naceCodes;
      } else if (item.nace && Array.isArray(item.nace)) {
        naceCodes = item.nace.map((n: any) => n.code);
      } else if (activityData.nace && Array.isArray(activityData.nace)) {
        naceCodes = activityData.nace.map((n: any) => n.code);
      }

      return {
        id: activityData.id || item.id,
        name: activityData.name || item.name || "Actividad sin nombre",
        sectorId: sectorData.id || 0,
        sectorName: sectorData.name || "Sector desconocido",
        naceCodes: naceCodes,
        description: item.activityDescription || activityData.description || "",
      };
    });

    console.log(`Actividades encontradas: ${processedActivities.length}`);

    // Devolver resultados
    return NextResponse.json(processedActivities);
  } catch (error) {
    console.error("Error al buscar actividades de taxonomía:", error);
    // Si falla, usamos datos de respaldo
    return NextResponse.json(fallbackActivities);
  }
}
