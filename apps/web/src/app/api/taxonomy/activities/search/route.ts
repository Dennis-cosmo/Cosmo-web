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

// Función de búsqueda local
function searchStaticActivities(query: string) {
  if (!query || query.trim().length < 2) return [];

  const searchText = query.toLowerCase();
  return staticActivities.filter(
    (activity) =>
      activity.name.toLowerCase().includes(searchText) ||
      (activity.naceCodes &&
        activity.naceCodes.some((code) =>
          code.toLowerCase().includes(searchText)
        ))
  );
}

export async function GET(request: Request) {
  // Extraer parámetro de búsqueda
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    console.log(`Buscando actividades con término: "${query}"`);

    // En Docker, usamos la variable API_INTERNAL_URL para contenedor api en entornos Docker
    const apiUrl = process.env.API_INTERNAL_URL || "http://localhost:4000";
    console.log("API URL para búsqueda:", apiUrl);

    try {
      // Llamar a nuestra API de búsqueda
      const response = await axios.get(
        `${apiUrl}/taxonomy/activities/search?query=${encodeURIComponent(query)}`,
        { timeout: 5000 }
      );

      // Verificar que la respuesta sea un array
      if (Array.isArray(response.data)) {
        console.log(
          `Resultados encontrados en backend: ${response.data.length}`
        );

        // Formatear resultados
        const formattedResults = response.data.map((item: any) => {
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

        return NextResponse.json(formattedResults);
      } else {
        console.error("Respuesta de API no es un array:", response.data);
        throw new Error("Formato de respuesta inválido");
      }
    } catch (apiError: any) {
      console.error(
        `Error específico al conectar con API (${apiUrl}):`,
        apiError.message
      );
      if (apiError.code === "ECONNREFUSED") {
        console.error("No se pudo conectar al backend. Usando búsqueda local.");
      }

      // Si falla, usar búsqueda en datos estáticos como respaldo
      const localResults = searchStaticActivities(query);
      console.log(`Resultados encontrados localmente: ${localResults.length}`);
      return NextResponse.json(localResults);
    }
  } catch (error) {
    console.error("Error general al buscar actividades:", error);
    // Si falla, usar búsqueda en datos estáticos como respaldo
    return NextResponse.json(searchStaticActivities(query));
  }
}
