// Definición de interfaces para los datos de taxonomía
export interface TaxonomySector {
  id: number;
  name: string;
  originalName?: string;
}

export interface TaxonomyActivity {
  id: number;
  name: string;
  sectorId: number;
  sectorName?: string; // Nombre del sector al que pertenece
  naceCodes?: string[];
  description?: string;
}

// Datos estáticos de sectores de la taxonomía EU
export const staticSectors: TaxonomySector[] = [
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

// Datos estáticos de actividades de la taxonomía EU
export const staticActivities: TaxonomyActivity[] = [
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
  {
    id: 403,
    name: "Generación de electricidad a partir de energía eólica",
    sectorId: 4,
    sectorName: "Energía",
    naceCodes: ["D35.11"],
  },
  {
    id: 404,
    name: "Generación de electricidad a partir de energía hidroeléctrica",
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
  {
    id: 302,
    name: "Fabricación de cemento",
    sectorId: 3,
    sectorName: "Manufactura",
    naceCodes: ["C23.51"],
  },
  {
    id: 303,
    name: "Fabricación de aluminio",
    sectorId: 3,
    sectorName: "Manufactura",
    naceCodes: ["C24.42"],
  },
  // Transporte
  {
    id: 601,
    name: "Transporte por ferrocarril de pasajeros",
    sectorId: 6,
    sectorName: "Transporte",
    naceCodes: ["H49.10"],
  },
  {
    id: 602,
    name: "Transporte por ferrocarril de mercancías",
    sectorId: 6,
    sectorName: "Transporte",
    naceCodes: ["H49.20"],
  },
  {
    id: 603,
    name: "Transporte público urbano y suburbano de pasajeros",
    sectorId: 6,
    sectorName: "Transporte",
    naceCodes: ["H49.31"],
  },
  // Construcción
  {
    id: 2101,
    name: "Construcción de edificios nuevos",
    sectorId: 21,
    sectorName: "Construcción y actividades inmobiliarias",
    naceCodes: ["F41.1", "F41.2"],
  },
  {
    id: 2102,
    name: "Renovación de edificios existentes",
    sectorId: 21,
    sectorName: "Construcción y actividades inmobiliarias",
    naceCodes: ["F41.1", "F41.2", "F43.91"],
  },
  // Información y comunicación
  {
    id: 801,
    name: "Procesamiento de datos, hosting y actividades conexas",
    sectorId: 8,
    sectorName: "Información y comunicación",
    naceCodes: ["J63.11"],
  },
  {
    id: 802,
    name: "Soluciones basadas en datos para reducir emisiones de GEI",
    sectorId: 8,
    sectorName: "Información y comunicación",
    naceCodes: ["J62", "J63.11"],
  },
];

// Función para buscar actividades por texto
export function searchActivities(query: string): TaxonomyActivity[] {
  if (!query || query.trim().length < 3) return [];

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

// Función para filtrar actividades por sectores
export function filterActivitiesBySectors(
  sectorIds: number[]
): TaxonomyActivity[] {
  if (!sectorIds || sectorIds.length === 0) return [];

  return staticActivities.filter((activity) =>
    sectorIds.includes(activity.sectorId)
  );
}
