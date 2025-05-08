/**
 * Script de migración para actualizar hashes antiguos de contraseñas a Argon2
 *
 * Este script se debe ejecutar manualmente cuando sea necesario actualizar hashes
 * de contraseñas SHA-256 existentes al formato seguro Argon2.
 *
 * NOTA: Este script solo debe ejecutarse por administradores del sistema
 * y requiere acceso directo a la base de datos.
 *
 * Uso: npx ts-node -r tsconfig-paths/register src/scripts/migrate-password-hashes.ts
 */

import { createConnection } from "typeorm";
import * as argon2 from "argon2";
import * as dotenv from "dotenv";
import { dataSource } from "@cosmo/database";
import { User } from "@cosmo/database";

// Cargar variables de entorno
dotenv.config();

// Constante para identificar los hashes SHA-256 antiguos
const SHA256_PREFIX = "sha256:";

async function migratePasswordHashes() {
  console.log("Iniciando migración de hashes de contraseñas...");

  // Conectar a la base de datos
  const connection = await createConnection({
    ...dataSource.options,
    entities: dataSource.options.entities,
  } as any);

  try {
    // Obtener repositorio de usuarios
    const userRepository = connection.getRepository(User);

    // Buscar todos los usuarios con hashes SHA-256
    const users = await userRepository
      .createQueryBuilder("user")
      .where("user.passwordHash LIKE :prefix", { prefix: `${SHA256_PREFIX}%` })
      .getMany();

    console.log(
      `Encontrados ${users.length} usuarios con hashes SHA-256 antiguos`
    );

    if (users.length === 0) {
      console.log(
        "No hay hashes para migrar. La base de datos ya está actualizada."
      );
      return;
    }

    // Confirmar antes de proceder
    console.log(
      "ADVERTENCIA: Este proceso modificará los hashes de contraseñas en la base de datos."
    );
    console.log(
      "Los usuarios NO podrán iniciar sesión con sus contraseñas actuales después de la migración."
    );
    console.log("Deberán usar la función de recuperación de contraseña.");
    console.log("");
    console.log(
      "Para continuar, presione Ctrl+C para cancelar o espere 10 segundos para proceder..."
    );

    // Esperar 10 segundos como medida de seguridad
    await new Promise((resolve) => setTimeout(resolve, 10000));

    console.log("Iniciando migración...");

    // Estadísticas de migración
    let successful = 0;
    let failed = 0;

    // Generar un token aleatorio para usar como marca temporal
    const temporalTokenMarker = Date.now().toString();

    // Para cada usuario, generar un nuevo hash Argon2 y actualizar la base de datos
    for (const user of users) {
      try {
        // Marcar el hash como "requiere reseteo" agregando un prefijo especial
        // Esto forzará a los usuarios a restablecer sus contraseñas
        const resetToken = await argon2.hash(`reset:${temporalTokenMarker}`, {
          type: argon2.argon2id,
          memoryCost: 16384,
          timeCost: 3,
          parallelism: 2,
        });

        // Actualizar el hash en la base de datos
        await userRepository.update(user.id, {
          passwordHash: resetToken,
        });

        successful++;

        // Mostrar progreso cada 10 usuarios
        if (successful % 10 === 0) {
          console.log(`Progreso: ${successful}/${users.length} completados`);
        }
      } catch (error) {
        console.error(`Error al migrar hash para usuario ${user.id}:`, error);
        failed++;
      }
    }

    console.log("\nMigración completada:");
    console.log(`- Total usuarios procesados: ${users.length}`);
    console.log(`- Exitosos: ${successful}`);
    console.log(`- Fallidos: ${failed}`);
    console.log(
      '\nLos usuarios deberán usar la función "Olvidé mi contraseña" para crear nuevas contraseñas.'
    );
  } catch (error) {
    console.error("Error durante la migración:", error);
  } finally {
    // Cerrar conexión
    await connection.close();
    console.log("Conexión a la base de datos cerrada");
  }
}

// Ejecutar la migración
migratePasswordHashes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error fatal durante la migración:", error);
    process.exit(1);
  });
