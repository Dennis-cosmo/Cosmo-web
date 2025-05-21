import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Definir las interfaces para los datos de taxonomía
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

// Hook para obtener sectores de taxonomía
export function useTaxonomySectors() {
  const [sectors, setSectors] = useState<TaxonomySector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        // Usar la ruta API proxy local
        const { data } = await axios.get("/api/taxonomy/sectors");
        setSectors(data);
        setError(null);
      } catch (err: any) {
        console.error("Error al obtener sectores de taxonomía:", err);
        setError(err.message || "Error al cargar sectores");
        // Usar datos de respaldo si la API falla
        setSectors([
          { id: 21, name: "Construcción y actividades inmobiliarias" },
          { id: 4, name: "Energía" },
          { id: 2, name: "Protección y restauración medioambiental" },
          { id: 1, name: "Silvicultura" },
          { id: 8, name: "Información y comunicación" },
          { id: 3, name: "Manufactura" },
          { id: 9, name: "Actividades profesionales, científicas y técnicas" },
          { id: 6, name: "Transporte" },
          {
            id: 5,
            name: "Suministro de agua, saneamiento, gestión de residuos",
          },
        ]);
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
  const [allActivities, setAllActivities] = useState<TaxonomyActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las actividades una sola vez
  useEffect(() => {
    const fetchAllActivities = async () => {
      try {
        setLoading(true);
        // Usar la ruta API proxy local
        const { data } = await axios.get(
          "/api/taxonomy/activities/matches/all"
        );

        // Asegurarse de que cada actividad tenga los campos necesarios
        const processedActivities = data.map((activity: any) => ({
          ...activity,
          // Asegurar que todos los campos requeridos existan
          id: activity.id || 0,
          name: activity.name || "",
          sectorId: activity.sectorId || 0,
          sectorName: activity.sectorName || "",
          naceCodes: activity.naceCodes || [],
          description: activity.description || "",
        }));

        setAllActivities(processedActivities);
        setError(null);
      } catch (err: any) {
        console.error("Error al obtener todas las actividades:", err);
        setError(err.message || "Error al cargar actividades");
        setAllActivities([]);
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

      // Eliminar actividades duplicadas (puede haber actividades con el mismo ID pero diferente sectorId)
      const uniqueActivities: TaxonomyActivity[] = [];
      const activityIds = new Set();

      for (const activity of filteredActivities) {
        if (!activityIds.has(activity.id)) {
          activityIds.add(activity.id);
          uniqueActivities.push(activity);
        }
      }

      return uniqueActivities;
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
      // Usar la ruta API proxy local
      const { data } = await axios.get(
        `/api/taxonomy/activities/search?query=${encodeURIComponent(query)}`
      );

      // Eliminar resultados duplicados por ID
      const uniqueResults: TaxonomyActivity[] = [];
      const resultIds = new Set();

      for (const activity of data) {
        if (!resultIds.has(activity.id)) {
          resultIds.add(activity.id);
          uniqueResults.push(activity);
        }
      }

      setSearchResults(uniqueResults);
      setError(null);
    } catch (err: any) {
      console.error(`Error al buscar actividades: ${err.message}`);
      setError(err.message || "Error al buscar actividades");
      setSearchResults([]);
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
