/**
 * Script para poblar inicialmente la base de datos con datos de taxonomía EU
 *
 * Uso:
 * - Asegúrate de tener configuradas las variables de entorno para la conexión a la base de datos
 * - Ejecuta con: npm run taxonomy:populate
 */

import axios from "axios";
import { createConnection, DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { TaxonomySector } from "../entities/taxonomy-sector.entity";
import { TaxonomyActivity } from "../entities/taxonomy-activity.entity";

// Cargar variables de entorno
dotenv.config();

const baseUrl = "https://webgate.ec.europa.eu/sft/api/v1/en";

async function populateTaxonomyData() {
  console.log("Iniciando población de datos de taxonomía EU...");

  // Conexión a la base de datos
  let connection: DataSource;

  try {
    connection = await new DataSource({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [TaxonomySector, TaxonomyActivity],
      synchronize: true,
    }).initialize();

    // 1. Sincronizar sectores
    const sectorRepository = connection.getRepository(TaxonomySector);

    // Comprobar si ya existen sectores
    const existingSectorsCount = await sectorRepository.count();
    if (existingSectorsCount > 0) {
      console.log(
        `Ya existen ${existingSectorsCount} sectores en la base de datos`
      );
    } else {
      console.log("No hay sectores existentes, sincronizando...");
      await syncSectors(connection);
    }

    // 2. Sincronizar actividades
    const activityRepository = connection.getRepository(TaxonomyActivity);

    // Comprobar si ya existen actividades
    const existingActivitiesCount = await activityRepository.count();
    if (existingActivitiesCount > 0) {
      console.log(
        `Ya existen ${existingActivitiesCount} actividades en la base de datos`
      );
    } else {
      // Verificar que hay sectores antes de intentar insertar actividades
      const sectorsCount = await sectorRepository.count();
      if (sectorsCount > 0) {
        console.log(
          `Hay ${sectorsCount} sectores, sincronizando actividades...`
        );
        await syncActivities(connection);
      } else {
        throw new Error(
          "No hay sectores en la base de datos, no se pueden sincronizar actividades"
        );
      }
    }

    console.log("Población de datos de taxonomía EU completada");
  } catch (error) {
    console.error(`Error en población de datos: ${error.message}`);
    throw error;
  } finally {
    // Cerrar conexión a la base de datos si se ha establecido
    if (connection) {
      await connection.destroy();
    }
  }
}

async function syncSectors(connection: DataSource) {
  console.log("Sincronizando sectores...");

  try {
    // Obtener sectores de la API externa
    const response = await axios.get(`${baseUrl}/sectors/objective/41`, {
      timeout: 10000,
    });

    if (!Array.isArray(response.data)) {
      throw new Error("La respuesta de sectores no es un array");
    }

    const sectorRepository = connection.getRepository(TaxonomySector);

    // Procesar y guardar sectores
    const sectors = response.data.map((sector) => ({
      id: sector.id,
      name: sector.name,
      originalName: sector.name,
    }));

    // Guardar cada sector individualmente con manejo de errores
    let successCount = 0;
    for (const sector of sectors) {
      try {
        await sectorRepository.save(sector);
        successCount++;
      } catch (err) {
        console.error(`Error al guardar sector ${sector.id}: ${err.message}`);
      }
    }

    console.log(`${successCount} sectores sincronizados correctamente`);
  } catch (error) {
    console.error(`Error al sincronizar sectores: ${error.message}`);
    throw error;
  }
}

async function syncActivities(connection: DataSource) {
  console.log("Sincronizando actividades...");

  try {
    // Obtener actividades de la API externa
    const response = await axios.get(`${baseUrl}/activities`, {
      timeout: 20000,
    });

    if (!Array.isArray(response.data)) {
      throw new Error("La respuesta de actividades no es un array");
    }

    const activityRepository = connection.getRepository(TaxonomyActivity);
    const sectorRepository = connection.getRepository(TaxonomySector);

    // Obtener todos los sectores existentes
    const existingSectors = await sectorRepository.find();
    const sectorIds = existingSectors.map((sector) => sector.id);

    // Procesar actividades y filtrar solo las que tienen un sector válido
    const activities = response.data
      .map((item) => {
        // Extraer datos del sector
        const sectorData = item.sector || {};
        const sectorId = sectorData.id || 0;

        // Extraer códigos NACE
        let naceCodes = [];
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
          name: item.name || "",
          description: description,
          sectorId: sectorId,
          naceCodes: naceCodes,
        };
      })
      .filter((activity) => {
        // Solo incluir actividades con sectores válidos que existan en nuestra BD
        return activity.sectorId && sectorIds.includes(activity.sectorId);
      });

    console.log(
      `Se procesaron ${response.data.length} actividades de la API, ${activities.length} tienen sectores válidos`
    );

    // Guardar actividades en la base de datos
    let successCount = 0;
    for (const activity of activities) {
      try {
        await activityRepository.save(activity);
        successCount++;
      } catch (err) {
        console.error(
          `Error al guardar actividad ${activity.id}: ${err.message}`
        );
      }
    }

    console.log(`${successCount} actividades sincronizadas correctamente`);
  } catch (error) {
    console.error(`Error al sincronizar actividades: ${error.message}`);
    throw error;
  }
}

// Ejecutar el script
populateTaxonomyData()
  .then(() => {
    console.log("Script completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error ejecutando el script:", error);
    process.exit(1);
  });
