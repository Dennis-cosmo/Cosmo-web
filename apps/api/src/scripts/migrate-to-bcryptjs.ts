/**
 * Script de migración para actualizar hashes existentes a bcryptjs
 *
 * Este script se debe ejecutar manualmente cuando sea necesario actualizar los hashes
 * de contraseñas de formatos antiguos al formato bcryptjs, que es más compatible con Docker.
 *
 * NOTA: Este script solo debe ejecutarse por administradores del sistema
 * y requiere acceso directo a la base de datos.
 *
 * Uso: npx ts-node -r tsconfig-paths/register src/scripts/migrate-to-bcryptjs.ts
 */

import { createConnection } from "typeorm";
// Comentamos temporalmente argon2 hasta que Docker esté configurado correctamente
// import * as argon2 from "argon2";
import * as bcryptjs from "bcryptjs";
import * as dotenv from "dotenv";
import { dataSource } from "@cosmo/database";
import { User } from "@cosmo/database";

// Cargar variables de entorno
dotenv.config();

// Constantes para identificar los diferentes tipos de hash
const SHA256_PREFIX = "sha256:";
const BCRYPT_PREFIX = "bcrypt:";

async function migratePasswordHashes() {
  console.log("Iniciando migración de hashes a bcryptjs...");

  // Conectar a la base de datos
  const connection = await createConnection({
    ...dataSource.options,
    entities: dataSource.options.entities,
  } as any);

  try {
    // Obtener repositorio de usuarios
    const userRepository = connection.getRepository(User);

    // Buscar todos los usuarios con hashes antiguos (los que no empiecen con BCRYPT_PREFIX)
    const users = await userRepository
      .createQueryBuilder("user")
      .where("user.passwordHash NOT LIKE :bcryptprefix", {
        bcryptprefix: `${BCRYPT_PREFIX}%`,
      })
      .getMany();

    console.log(
      `Encontrados ${users.length} usuarios con hashes que necesitan migración`
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
      "Los usuarios tendrán que resetear sus contraseñas si la migración falla."
    );
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

    // Generar un token aleatorio para usar como marca temporal en caso de emergencia
    const randomToken = Math.random().toString(36).substring(2, 15);

    // Para cada usuario, intentamos generar un nuevo hash bcryptjs
    for (const user of users) {
      try {
        console.log(`Procesando usuario ${user.id}...`);

        // Aplicar contraseña de emergencia si no podemos migrar el hash actual
        const salt = await bcryptjs.genSalt(12);
        const emergencyPassword = `reset_required_${randomToken}`;
        const newHash =
          BCRYPT_PREFIX + (await bcryptjs.hash(emergencyPassword, salt));

        // Actualizar el hash de contraseña
        await userRepository.update(user.id, {
          passwordHash: newHash,
        });

        console.log(
          `Usuario ${user.id} migrado a bcryptjs (con contraseña temporal)`
        );
        successful++;
      } catch (error) {
        console.error(
          `Error al migrar usuario ${user.id}: ${error instanceof Error ? error.message : String(error)}`
        );
        failed++;
      }
    }

    console.log("\nMigración completada:");
    console.log(`- Usuarios exitosamente migrados: ${successful}`);
    console.log(`- Usuarios con errores: ${failed}`);

    if (successful > 0) {
      console.log(
        "\nIMPORTANTE: Los usuarios tendrán que usar la funcionalidad de"
      );
      console.log(
        "'Olvidé mi contraseña' para establecer una nueva contraseña."
      );
    }
  } catch (error) {
    console.error(
      `Error en la migración: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    // Cerrar la conexión
    if (connection.isConnected) {
      await connection.close();
    }
    console.log("Proceso de migración finalizado.");
  }
}

// Ejecutar la función principal
migratePasswordHashes().catch((error) => {
  console.error(
    `Error fatal en el script: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
