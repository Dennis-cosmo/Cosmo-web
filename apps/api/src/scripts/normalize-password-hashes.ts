import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@cosmo/database";
import { Repository } from "typeorm";
import * as bcryptjs from "bcryptjs";
import { Logger } from "@nestjs/common";

// Prefijos para identificar hashes
const BCRYPT_PREFIX = "bcrypt:";
const SHA256_PREFIX = "sha256:";

/**
 * Script de migración que normaliza los hashes de contraseñas en la base de datos
 * eliminando los prefijos y asegurando que todos los hashes están en formato bcrypt estándar.
 *
 * Este es un enfoque sistemático para resolver problemas de autenticación
 * relacionados con formatos de hash inconsistentes.
 */
async function normalizePasswordHashes() {
  const logger = new Logger("PasswordNormalizer");
  logger.log("Iniciando normalización de hashes de contraseñas...");

  try {
    // Iniciar la aplicación NestJS
    const app = await NestFactory.create(AppModule, {
      logger: ["error", "warn"],
    });
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // Obtener todos los usuarios
    const users = await userRepository.find();
    logger.log(`Se encontraron ${users.length} usuarios en la base de datos.`);

    // Estadísticas de migración
    let prefixedBcrypt = 0;
    let prefixedSha256 = 0;
    let noPrefix = 0;
    let processed = 0;
    let errors = 0;

    // Procesar cada usuario
    for (const user of users) {
      try {
        const hash = user.passwordHash;

        // Solo procesar si tiene un prefijo conocido
        if (hash.startsWith(BCRYPT_PREFIX)) {
          prefixedBcrypt++;
          // Eliminar el prefijo bcrypt:
          const actualHash = hash.substring(BCRYPT_PREFIX.length);
          // Verificar formato válido de bcrypt
          if (actualHash.startsWith("$2")) {
            await userRepository.update(user.id, { passwordHash: actualHash });
            processed++;
            logger.log(
              `Usuario ${user.id} (${user.email}): Prefijo bcrypt: eliminado correctamente`
            );
          } else {
            logger.warn(
              `Usuario ${user.id} (${user.email}): Hash con prefijo bcrypt: pero formato inválido`
            );
            errors++;
          }
        } else if (hash.startsWith(SHA256_PREFIX)) {
          prefixedSha256++;
          logger.warn(
            `Usuario ${user.id} (${user.email}): Tipo de hash SHA-256 obsoleto, requiere actualización manual`
          );
          errors++;
        } else if (hash.startsWith("$2")) {
          // Ya está en formato correcto
          noPrefix++;
          logger.log(
            `Usuario ${user.id} (${user.email}): Hash ya en formato correcto`
          );
        } else {
          logger.warn(
            `Usuario ${user.id} (${user.email}): Formato de hash desconocido`
          );
          errors++;
        }
      } catch (error) {
        errors++;
        logger.error(
          `Error al procesar usuario ${user.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Mostrar resumen
    logger.log("====== RESUMEN DE NORMALIZACIÓN ======");
    logger.log(`Total de usuarios: ${users.length}`);
    logger.log(`Usuarios con prefijo bcrypt:: ${prefixedBcrypt}`);
    logger.log(`Usuarios con prefijo sha256:: ${prefixedSha256}`);
    logger.log(`Usuarios sin prefijo (formato correcto): ${noPrefix}`);
    logger.log(`Usuarios procesados correctamente: ${processed}`);
    logger.log(`Errores encontrados: ${errors}`);

    // Verificar consistencia después de la migración
    const usersAfter = await userRepository.find();
    let invalidAfter = 0;

    for (const user of usersAfter) {
      if (
        user.passwordHash.includes("bcrypt:") ||
        user.passwordHash.includes("sha256:")
      ) {
        invalidAfter++;
      }
    }

    if (invalidAfter > 0) {
      logger.warn(
        `Aún quedan ${invalidAfter} usuarios con prefijos en sus hashes`
      );
    } else {
      logger.log("✅ Todos los usuarios tienen ahora hashes sin prefijos");
    }

    await app.close();
  } catch (error) {
    Logger.error(
      `Error durante la normalización: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Ejecutar el script
normalizePasswordHashes()
  .then(() => console.log("Script de normalización completado"))
  .catch((error) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error en el script de normalización: ${errorMessage}`);
  });
