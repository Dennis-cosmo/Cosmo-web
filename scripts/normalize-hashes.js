/**
 * Script para normalizar hashes de contraseñas en la base de datos
 *
 * Este script elimina los prefijos innecesarios (bcrypt:) de los hashes
 * y asegura que todos estén en formato bcrypt estándar.
 */

const { Client } = require("pg");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Prefijos conocidos
const BCRYPT_PREFIX = "bcrypt:";
const SHA256_PREFIX = "sha256:";

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "cosmodb",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
};

async function normalizeHashes() {
  const client = new Client(dbConfig);

  try {
    console.log("Conectando a la base de datos...");
    await client.connect();
    console.log("Conexión exitosa a la base de datos");

    // 1. Obtener todos los usuarios
    console.log("Obteniendo usuarios...");
    const { rows: users } = await client.query(
      'SELECT id, email, "passwordHash" FROM users'
    );
    console.log(`Se encontraron ${users.length} usuarios`);

    // 2. Procesar cada usuario
    let updatedCount = 0;
    let alreadyNormalizedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const { id, email, passwordHash } = user;
        let needsUpdate = false;
        let newHash = passwordHash;

        // Verificar el formato del hash
        if (passwordHash.startsWith(BCRYPT_PREFIX)) {
          console.log(`Usuario ${email}: Hash con prefijo bcrypt encontrado`);
          newHash = passwordHash.substring(BCRYPT_PREFIX.length);
          needsUpdate = true;
        } else if (passwordHash.startsWith(SHA256_PREFIX)) {
          console.log(
            `Usuario ${email}: Hash SHA-256 encontrado - requiere actualización manual`
          );
          errorCount++;
          continue; // No podemos actualizar hashes SHA-256 sin la contraseña original
        } else if (!passwordHash.startsWith("$2")) {
          console.log(
            `Usuario ${email}: Hash en formato desconocido - requiere actualización manual`
          );
          errorCount++;
          continue;
        } else {
          console.log(
            `Usuario ${email}: Hash ya está en formato bcrypt estándar`
          );
          alreadyNormalizedCount++;
          continue;
        }

        // Actualizar el hash si es necesario
        if (needsUpdate) {
          await client.query(
            'UPDATE users SET "passwordHash" = $1 WHERE id = $2',
            [newHash, id]
          );
          console.log(`Usuario ${email}: Hash actualizado correctamente`);
          updatedCount++;
        }
      } catch (userError) {
        console.error(`Error procesando usuario ${user.email}:`, userError);
        errorCount++;
      }
    }

    // 3. Mostrar resultados
    console.log("\nResumen de normalización:");
    console.log("------------------------");
    console.log(`Total de usuarios: ${users.length}`);
    console.log(`Hashes ya normalizados: ${alreadyNormalizedCount}`);
    console.log(`Hashes actualizados: ${updatedCount}`);
    console.log(`Errores/requieren actualización manual: ${errorCount}`);
  } catch (error) {
    console.error("Error en la normalización de hashes:", error);
  } finally {
    await client.end();
    console.log("Conexión a la base de datos cerrada");
  }
}

// Ejecutar el script
normalizeHashes().catch(console.error);
