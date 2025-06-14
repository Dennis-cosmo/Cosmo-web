import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  staticSectors,
  staticActivities,
  searchActivities as searchStaticActivities,
  TaxonomySector,
  TaxonomyActivity,
} from "../data/taxonomyData";

/**
 * Documentación de los endpoints de la Taxonomía EU usados:
 *
 * 1. https://webgate.ec.europa.eu/sft/api/v1/en/sectors/objective/41
 *    - Devuelve todos los sectores de la taxonomía para el objetivo climático 1 (mitigación)
 *
 * 2. https://webgate.ec.europa.eu/sft/api/v1/en/activities/matches/all
 *    - Devuelve todas las actividades económicas de la taxonomía
 *    - Contiene información sobre el sectorId para poder filtrar localmente
 *    - Se puede usar para búsquedas por texto en el nombre o códigos NACE
 *
 * Para más información sobre la Taxonomía EU visitar:
 * https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en
 */

// Datos estáticos de respaldo (fallback)
const fallbackSectors: TaxonomySector[] = [
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

// Hook para obtener sectores de taxonomía
export function useTaxonomySectors() {
  const [sectors, setSectors] = useState<TaxonomySector[]>(staticSectors);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        // Inicialmente usamos datos estáticos pero intentamos actualizar con datos de API
        setLoading(true);
        const response = await axios.get("/api/taxonomy/sectors");
        const data = response.data;

        if (data && Array.isArray(data) && data.length > 0) {
          console.log("Sectores obtenidos de API:", data.length);
          setSectors(data);
        } else {
          console.log(
            "No se obtuvieron sectores de API, usando datos estáticos"
          );
        }
        setError(null);
      } catch (err: any) {
        console.error("Error al obtener sectores de taxonomía:", err);
        setError(err.message || "Error al cargar sectores");
        console.log("Usando datos estáticos de sectores debido al error");
        // Ya tenemos datos estáticos cargados, así que no hacemos nada más
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  return { sectors, loading, error };
}

// Hook para obtener todas las actividades y filtrarlas por sectores seleccionados
export function useAllTaxonomyActivities() {
  const [allActivities, setAllActivities] =
    useState<TaxonomyActivity[]>(staticActivities);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllActivities = async () => {
      try {
        // Inicialmente usamos datos estáticos pero intentamos actualizar con datos de API
        setLoading(true);
        const response = await axios.get(
          "/api/taxonomy/activities/matches/all"
        );
        const data = response.data;

        if (data && Array.isArray(data) && data.length > 0) {
          console.log("Actividades obtenidas de API:", data.length);

          // Asegurarse de que cada actividad tenga los campos necesarios
          const processedActivities = data.map((activity: any) => ({
            ...activity,
            id: activity.id || 0,
            name: activity.name || "",
            sectorId: activity.sectorId || 0,
            sectorName: activity.sectorName || "",
            naceCodes: activity.naceCodes || [],
            description: activity.description || "",
          }));

          setAllActivities(processedActivities);
        } else {
          console.log(
            "No se obtuvieron actividades de API, usando datos estáticos"
          );
        }
        setError(null);
      } catch (err: any) {
        console.error("Error al obtener actividades:", err);
        setError(err.message || "Error al cargar actividades");
        console.log("Usando datos estáticos de actividades debido al error");
        // Ya tenemos datos estáticos cargados, así que no hacemos nada más
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  }, []);

  // Función para filtrar actividades por sectores seleccionados
  const getActivitiesBySectors = useCallback(
    (sectorIds: number[]) => {
      if (!sectorIds || sectorIds.length === 0) return [];

      // Filtrar actividades por los sectores seleccionados
      const filteredActivities = allActivities.filter((activity) =>
        sectorIds.includes(activity.sectorId)
      );

      return filteredActivities;
    },
    [allActivities]
  );

  return {
    allActivities,
    getActivitiesBySectors,
    loading,
    error,
  };
}

// Hook para buscar actividades por texto
export function useSearchTaxonomyActivities() {
  const [searchResults, setSearchResults] = useState<TaxonomyActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchActivities = useCallback(async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);

      // Intentar obtener resultados de la API
      try {
        const response = await axios.get(
          `/api/taxonomy/activities/search?query=${encodeURIComponent(query)}`
        );
        const data = response.data;

        if (data && Array.isArray(data) && data.length > 0) {
          console.log("Resultados de búsqueda de API:", data.length);
          setSearchResults(data);
          setLoading(false);
          return;
        } else {
          console.log(
            "No se encontraron resultados en la API, buscando en datos estáticos"
          );
        }
      } catch (apiError) {
        console.error(
          "Error de API en búsqueda, usando datos estáticos:",
          apiError
        );
      }

      // Si la API falla o no devuelve datos, usar la búsqueda estática
      const results = searchStaticActivities(query);
      console.log(
        `Búsqueda estática para "${query}": ${results.length} resultados`
      );
      setSearchResults(results);
      setError(null);
    } catch (err: any) {
      console.error(`Error al buscar actividades: ${err.message}`);
      setError(err.message || "Error al buscar actividades");

      // Último recurso: búsqueda en datos estáticos
      const results = searchStaticActivities(query);
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchActivities, searchResults, loading, error };
}

// Hook para obtener información de la API de taxonomía EU
export function useTaxonomyApiInfo() {
  return {
    apiEndpoints: {
      sectors:
        "https://webgate.ec.europa.eu/sft/api/v1/en/sectors/objective/41",
      activities:
        "https://webgate.ec.europa.eu/sft/api/v1/en/activities/matches/all",
    },
    documentation:
      "https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en",
    navigator: "https://taxonomy.ec.europa.eu/",
    objectives: [
      { id: 1, name: "Mitigación del cambio climático" },
      { id: 2, name: "Adaptación al cambio climático" },
      {
        id: 3,
        name: "Uso sostenible y protección de recursos hídricos y marinos",
      },
      { id: 4, name: "Transición a una economía circular" },
      { id: 5, name: "Prevención y control de la contaminación" },
      {
        id: 6,
        name: "Protección y restauración de la biodiversidad y los ecosistemas",
      },
    ],
  };
}
