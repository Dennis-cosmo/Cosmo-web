import { createConnection } from "typeorm";
import { User } from "@cosmo/database";
import { dataSource } from "@cosmo/database";

// Prefijos para identificar hashes
const BCRYPT_PREFIX = "bcrypt:";
const SHA256_PREFIX = "sha256:";

/**
 * Script de migración simplificado que normaliza los hashes de contraseñas en la base de datos
 * Sin depender de NestJS ni JwtStrategy
 */
async function directNormalizeHashes() {
  console.log("Iniciando normalización directa de hashes de contraseñas...");

  // Conexión a la base de datos
  const connection = await createConnection({
    ...dataSource.options,
    entities: dataSource.options.entities,
  } as any);

  try {
    const userRepository = connection.getRepository(User);

    // Obtener todos los usuarios
    const users = await userRepository.find();
    console.log(`Se encontraron ${users.length} usuarios en la base de datos.`);

    // Estadísticas
    let prefixedBcrypt = 0;
    let prefixedSha256 = 0;
    let noPrefix = 0;
    let processed = 0;
    let errors = 0;

    // Procesar usuarios
    for (const user of users) {
      try {
        const hash = user.passwordHash;

        if (!hash) {
          console.log(
            `Usuario ${user.id} (${user.email}): Sin hash de contraseña`
          );
          continue;
        }

        // Procesar hash con prefijo bcrypt:
        if (hash.startsWith(BCRYPT_PREFIX)) {
          prefixedBcrypt++;
          const actualHash = hash.substring(BCRYPT_PREFIX.length);

          if (actualHash.startsWith("$2")) {
            await userRepository.update(user.id, { passwordHash: actualHash });
            processed++;
            console.log(
              `✅ Usuario ${user.id} (${user.email}): Prefijo bcrypt: eliminado correctamente`
            );
          } else {
            console.log(
              `⚠️ Usuario ${user.id} (${user.email}): Hash con prefijo bcrypt: pero formato inválido`
            );
            errors++;
          }
        } else if (hash.startsWith(SHA256_PREFIX)) {
          prefixedSha256++;
          console.log(
            `⚠️ Usuario ${user.id} (${user.email}): Tipo de hash SHA-256 obsoleto`
          );
          errors++;
        } else if (hash.startsWith("$2")) {
          noPrefix++;
          console.log(
            `✓ Usuario ${user.id} (${user.email}): Hash ya en formato correcto`
          );
        } else {
          console.log(
            `⚠️ Usuario ${user.id} (${user.email}): Formato de hash desconocido`
          );
          errors++;
        }
      } catch (error) {
        errors++;
        console.error(
          `❌ Error al procesar usuario ${user.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Resumen
    console.log("\n====== RESUMEN DE NORMALIZACIÓN ======");
    console.log(`Total de usuarios: ${users.length}`);
    console.log(`Usuarios con prefijo bcrypt:: ${prefixedBcrypt}`);
    console.log(`Usuarios con prefijo sha256:: ${prefixedSha256}`);
    console.log(`Usuarios sin prefijo (formato correcto): ${noPrefix}`);
    console.log(`Usuarios procesados correctamente: ${processed}`);
    console.log(`Errores encontrados: ${errors}`);

    // Verificación final
    const usersAfter = await userRepository.find();
    let invalidAfter = 0;

    for (const user of usersAfter) {
      if (
        user.passwordHash &&
        (user.passwordHash.includes("bcrypt:") ||
          user.passwordHash.includes("sha256:"))
      ) {
        invalidAfter++;
      }
    }

    if (invalidAfter > 0) {
      console.log(
        `⚠️ Aún quedan ${invalidAfter} usuarios con prefijos en sus hashes`
      );
    } else {
      console.log("✅ Todos los usuarios tienen ahora hashes sin prefijos");
    }
  } catch (error) {
    console.error(
      `❌ Error general: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    // Cerrar la conexión
    if (connection.isConnected) {
      await connection.close();
      console.log("Conexión a la base de datos cerrada.");
    }
  }
}

// Ejecutar el script
directNormalizeHashes()
  .then(() => console.log("Script de normalización directa completado"))
  .catch((error) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error en el script: ${errorMessage}`);
  });
