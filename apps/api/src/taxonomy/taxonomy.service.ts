import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

import { TaxonomySector } from "./entities/taxonomy-sector.entity";
import { TaxonomyActivity } from "./entities/taxonomy-activity.entity";

@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);
  private readonly baseUrl = "https://webgate.ec.europa.eu/sft/api/v1/en";

  constructor(
    @InjectRepository(TaxonomySector)
    private sectorRepository: Repository<TaxonomySector>,
    @InjectRepository(TaxonomyActivity)
    private activityRepository: Repository<TaxonomyActivity>,
    private configService: ConfigService
  ) {}

  /**
   * Obtiene todos los sectores de taxonomía de la base de datos
   */
  async getSectors(): Promise<TaxonomySector[]> {
    try {
      return await this.sectorRepository.find();
    } catch (error) {
      this.logger.error(`Error al obtener sectores: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtiene todas las actividades de taxonomía de la base de datos
   */
  async getAllActivities(): Promise<TaxonomyActivity[]> {
    try {
      return await this.activityRepository.find({
        relations: ["sector"],
      });
    } catch (error) {
      this.logger.error(`Error al obtener actividades: ${error.message}`);
      return [];
    }
  }

  /**
   * Busca actividades por término
   */
  async searchActivities(query: string): Promise<TaxonomyActivity[]> {
    try {
      return await this.activityRepository
        .createQueryBuilder("activity")
        .innerJoinAndSelect("activity.sector", "sector")
        .where("activity.name ILIKE :query", { query: `%${query}%` })
        .orWhere("activity.naceCodes ILIKE :query", { query: `%${query}%` })
        .getMany();
    } catch (error) {
      this.logger.error(`Error al buscar actividades: ${error.message}`);
      return [];
    }
  }

  /**
   * Sincroniza los datos desde la API externa a nuestra base de datos
   */
  async syncTaxonomyData(): Promise<void> {
    try {
      this.logger.log("Iniciando sincronización de datos de taxonomía...");

      // 1. Sincronizar sectores
      await this.syncSectors();

      // 2. Sincronizar actividades
      await this.syncActivities();

      this.logger.log("Sincronización de datos de taxonomía completada");
    } catch (error) {
      this.logger.error(`Error en sincronización: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sincroniza los sectores desde la API externa
   */
  private async syncSectors(): Promise<void> {
    try {
      this.logger.log("Sincronizando sectores...");

      // Obtener sectores de la API externa
      const response = await axios.get(`${this.baseUrl}/sectors/objective/41`, {
        timeout: 10000,
      });

      if (!Array.isArray(response.data)) {
        throw new Error("La respuesta de sectores no es un array");
      }

      const sectors = response.data.map((sector) => ({
        id: sector.id,
        name: sector.name,
        originalName: sector.name,
      }));

      // Guardar sectores en la base de datos
      for (const sector of sectors) {
        await this.sectorRepository.save(sector);
      }

      this.logger.log(`${sectors.length} sectores sincronizados correctamente`);
    } catch (error) {
      this.logger.error(`Error al sincronizar sectores: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sincroniza las actividades desde la API externa
   */
  private async syncActivities(): Promise<void> {
    try {
      this.logger.log("Sincronizando actividades...");

      // Obtener actividades de la API externa
      const response = await axios.get(`${this.baseUrl}/activities`, {
        timeout: 20000,
      });

      if (!Array.isArray(response.data)) {
        throw new Error("La respuesta de actividades no es un array");
      }

      // Procesar actividades
      const activities = response.data.map((item) => {
        // Extraer datos del sector
        const sectorData = item.sector || {};

        // Extraer códigos NACE
        let naceCodes: string[] = [];
        if (item.naceCodes && Array.isArray(item.naceCodes)) {
          naceCodes = item.naceCodes;
        }

        // Limpiar texto de descripción
        let description = item.description || "";
        if (description) {
          // Eliminar caracteres especiales y formato extraño
          description = description
            .replace(/\\n/g, " ")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")")
            .replace(/\\'/g, "'")
            .replace(/\s+/g, " ")
            .trim();
        }

        return {
          id: item.id,
          name: item.name,
          description: description,
          sectorId: sectorData.id || 0,
          naceCodes: naceCodes,
        };
      });

      // Guardar actividades en la base de datos
      for (const activity of activities) {
        await this.activityRepository.save(activity);
      }

      this.logger.log(
        `${activities.length} actividades sincronizadas correctamente`
      );
    } catch (error) {
      this.logger.error(`Error al sincronizar actividades: ${error.message}`);
      throw error;
    }
  }
}
