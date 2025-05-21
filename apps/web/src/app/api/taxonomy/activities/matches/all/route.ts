import { NextResponse } from "next/server";
import axios from "axios";

// Datos de fallback para cuando la API falla
const fallbackActivities = [
  // Energía
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
  // Manufactura
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
  // Transporte
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
];

export async function GET() {
  try {
    // Luego obtenemos todas las actividades
    const activitiesResponse = await axios.get(
      "https://webgate.ec.europa.eu/sft/api/v1/en/activities/matches/all"
    );

    // Procesamos las actividades para adaptarlas a nuestra estructura interna
    const processedActivities = activitiesResponse.data.map((item: any) => {
      // La estructura real tiene activity anidado
      const activityData = item.activity || {};
      const sectorData = activityData.sector || {};

      // Extraer los códigos NACE si existen
      let naceCodes: string[] = [];

      // Intentar extraer códigos NACE de diferentes posibles ubicaciones
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
        // Usamos el ID de la actividad principal o del item
        id: activityData.id || item.id,
        // Nombre de la actividad
        name: activityData.name || item.name || "Actividad sin nombre",
        // ID del sector al que pertenece
        sectorId: sectorData.id || 0,
        // Nombre del sector
        sectorName: sectorData.name || "Sector desconocido",
        // Códigos NACE
        naceCodes: naceCodes,
        // Descripción
        description: item.activityDescription || activityData.description || "",
      };
    });

    // Devolver los datos procesados al frontend
    return NextResponse.json(processedActivities);
  } catch (error) {
    console.error("Error al obtener actividades de taxonomía:", error);
    // Si falla, usamos datos de respaldo
    return NextResponse.json(fallbackActivities);
  }
}
