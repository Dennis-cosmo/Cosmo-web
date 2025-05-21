import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

export interface TaxonomySector {
  id: number;
  name: string;
}

export interface TaxonomyActivity {
  id: number;
  name: string;
  sectorId: number;
  naceCodes?: string[];
  description?: string;
}

@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);
  private readonly baseUrl = "https://webgate.ec.europa.eu/sft/api/v1";
  private sectorCache: TaxonomySector[] = [];
  private activitiesCache: Record<number, TaxonomyActivity[]> = {};

  constructor(private configService: ConfigService) {}

  /**
   * Obtiene todos los sectores de la taxonomía UE para el objetivo 41 (mitigación del cambio climático)
   */
  async getSectors(objective: number = 41): Promise<TaxonomySector[]> {
    try {
      // Si ya tenemos los sectores en cache, los devolvemos
      if (this.sectorCache.length > 0) {
        return this.sectorCache;
      }

      const response = await axios.get<TaxonomySector[]>(
        `${this.baseUrl}/en/sectors/objective/${objective}`
      );
      this.sectorCache = response.data;
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error al obtener sectores de taxonomía UE: ${error.message}`
      );

      // Si hay un error, devolver sectores hardcodeados (podría venir de un backup local)
      return this.getFallbackSectors();
    }
  }

  /**
   * Obtiene las actividades económicas para un sector específico
   */
  async getActivitiesBySector(sectorId: number): Promise<TaxonomyActivity[]> {
    try {
      // Si ya tenemos las actividades en cache, las devolvemos
      if (this.activitiesCache[sectorId]) {
        return this.activitiesCache[sectorId];
      }

      const response = await axios.get<TaxonomyActivity[]>(
        `${this.baseUrl}/en/activities/sector/${sectorId}`
      );
      this.activitiesCache[sectorId] = response.data.map((activity) => ({
        ...activity,
        sectorId,
      }));
      return this.activitiesCache[sectorId];
    } catch (error: any) {
      this.logger.error(
        `Error al obtener actividades para el sector ${sectorId}: ${error.message}`
      );

      // Si hay un error, devolver actividades hardcodeadas para ese sector
      return this.getFallbackActivities(sectorId);
    }
  }

  /**
   * Obtiene detalles de una actividad específica
   */
  async getActivityDetails(
    activityId: number
  ): Promise<TaxonomyActivity | null> {
    try {
      const response = await axios.get<TaxonomyActivity>(
        `${this.baseUrl}/en/activities/${activityId}`
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Error al obtener detalles de la actividad ${activityId}: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Busca actividades por término de búsqueda
   */
  async searchActivities(query: string): Promise<TaxonomyActivity[]> {
    try {
      const response = await axios.get<TaxonomyActivity[]>(
        `${this.baseUrl}/en/activities/search?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error al buscar actividades: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtiene sectores de respaldo en caso de que la API esté caída
   */
  private getFallbackSectors(): TaxonomySector[] {
    return [
      { id: 21, name: "Construction and real estate activities" },
      { id: 4, name: "Energy" },
      { id: 2, name: "Environmental protection and restoration activities" },
      { id: 1, name: "Forestry" },
      { id: 8, name: "Information and communication" },
      { id: 3, name: "Manufacturing" },
      { id: 9, name: "Professional, scientific and technical activities" },
      { id: 6, name: "Transport" },
      {
        id: 5,
        name: "Water supply, sewerage, waste management and remediation",
      },
    ];
  }

  /**
   * Obtiene actividades de respaldo para un sector específico
   */
  private getFallbackActivities(sectorId: number): TaxonomyActivity[] {
    // Aquí podríamos tener actividades de respaldo para cada sector
    // Este es solo un ejemplo para el sector de energía (4)
    if (sectorId === 4) {
      return [
        {
          id: 401,
          name: "Electricity generation using solar photovoltaic technology",
          sectorId: 4,
          naceCodes: ["D35.11"],
        },
        {
          id: 402,
          name: "Electricity generation using concentrated solar power technology",
          sectorId: 4,
          naceCodes: ["D35.11"],
        },
        {
          id: 403,
          name: "Electricity generation from wind power",
          sectorId: 4,
          naceCodes: ["D35.11"],
        },
        {
          id: 404,
          name: "Electricity generation from ocean energy technologies",
          sectorId: 4,
          naceCodes: ["D35.11"],
        },
        {
          id: 405,
          name: "Electricity generation from hydropower",
          sectorId: 4,
          naceCodes: ["D35.11"],
        },
      ];
    }

    return [];
  }
}
