import { NextResponse } from "next/server";

// Datos de respaldo para cuando la API externa no está disponible
const fallbackActivities = {
  // Sector de Energía
  4: [
    {
      id: 401,
      name: "Generación de electricidad mediante tecnología solar fotovoltaica",
      sectorId: 4,
      naceCodes: ["D35.11"],
    },
    {
      id: 402,
      name: "Generación de electricidad mediante tecnología solar concentrada",
      sectorId: 4,
      naceCodes: ["D35.11"],
    },
    {
      id: 403,
      name: "Generación de electricidad a partir de energía eólica",
      sectorId: 4,
      naceCodes: ["D35.11"],
    },
    {
      id: 404,
      name: "Generación de electricidad a partir de tecnologías de energía oceánica",
      sectorId: 4,
      naceCodes: ["D35.11"],
    },
    {
      id: 405,
      name: "Generación de electricidad a partir de energía hidroeléctrica",
      sectorId: 4,
      naceCodes: ["D35.11"],
    },
  ],
  // Sector de Manufactura
  3: [
    {
      id: 301,
      name: "Fabricación de tecnologías bajas en carbono",
      sectorId: 3,
      naceCodes: ["C25", "C27", "C28"],
    },
    {
      id: 302,
      name: "Fabricación de cemento",
      sectorId: 3,
      naceCodes: ["C23.51"],
    },
    {
      id: 303,
      name: "Fabricación de aluminio",
      sectorId: 3,
      naceCodes: ["C24.42"],
    },
    {
      id: 304,
      name: "Fabricación de hierro y acero",
      sectorId: 3,
      naceCodes: ["C24.1", "C24.2", "C24.3"],
    },
    {
      id: 305,
      name: "Fabricación de productos químicos",
      sectorId: 3,
      naceCodes: ["C20"],
    },
  ],
  // Sector de Transporte
  6: [
    {
      id: 601,
      name: "Transporte por ferrocarril de pasajeros",
      sectorId: 6,
      naceCodes: ["H49.10"],
    },
    {
      id: 602,
      name: "Transporte por ferrocarril de mercancías",
      sectorId: 6,
      naceCodes: ["H49.20"],
    },
    {
      id: 603,
      name: "Transporte público urbano y suburbano",
      sectorId: 6,
      naceCodes: ["H49.31"],
    },
    {
      id: 604,
      name: "Infraestructura para movilidad personal, logística de bicicletas",
      sectorId: 6,
      naceCodes: ["F42.11", "H49.39"],
    },
    {
      id: 605,
      name: "Transporte por vías navegables interiores de pasajeros",
      sectorId: 6,
      naceCodes: ["H50.30"],
    },
  ],
  // Silvicultura
  1: [
    { id: 101, name: "Forestación", sectorId: 1, naceCodes: ["A02.10"] },
    {
      id: 102,
      name: "Rehabilitación y restauración de bosques",
      sectorId: 1,
      naceCodes: ["A02.10"],
    },
    {
      id: 103,
      name: "Gestión forestal",
      sectorId: 1,
      naceCodes: ["A02.10", "A02.20"],
    },
    {
      id: 104,
      name: "Actividades de conservación forestal",
      sectorId: 1,
      naceCodes: ["A02.10"],
    },
  ],
};

export async function GET(
  request: Request,
  { params }: { params: { sectorId: string } }
) {
  try {
    const sectorId = parseInt(params.sectorId, 10);
    if (isNaN(sectorId)) {
      return NextResponse.json(
        { error: "ID de sector inválido" },
        { status: 400 }
      );
    }

    // Intentar obtener los datos reales de la API externa
    // Ahora usamos la API de actividades completa y filtramos por sectorId
    try {
      const response = await fetch(
        `https://webgate.ec.europa.eu/sft/api/v1/en/activities/matches/all`,
        {
          headers: {
            Accept: "application/json",
          },
          cache: "force-cache", // Usar caching para mejorar rendimiento
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Filtrar las actividades por el sectorId solicitado
        const filteredActivities = data.filter(
          (activity: any) => activity.sectorId === sectorId
        );

        return NextResponse.json(filteredActivities);
      }
    } catch (error) {
      console.error(
        `Error al obtener actividades del sector ${sectorId} desde API externa:`,
        error
      );
    }

    // Si no se pudieron obtener datos reales, usar el fallback
    if (fallbackActivities[sectorId as keyof typeof fallbackActivities]) {
      return NextResponse.json(
        fallbackActivities[sectorId as keyof typeof fallbackActivities]
      );
    }

    // Si no hay fallback para este sector, devolver array vacío
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error en endpoint de actividades por sector:", error);
    return NextResponse.json(
      { error: "Error al obtener actividades" },
      { status: 500 }
    );
  }
}
