/**
 * Script para probar la validación de contraseñas con bcrypt
 *
 * Este script permite verificar que la biblioteca bcrypt está funcionando
 * correctamente para validar las contraseñas almacenadas.
 */

const bcrypt = require("bcryptjs");
const { Client } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "cosmodb",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
};

// Prefijos conocidos
const BCRYPT_PREFIX = "bcrypt:";
const SHA256_PREFIX = "sha256:";

// Obtener email y contraseña de prueba
const testEmail = process.argv[2] || "prueba@test.com";
const testPassword = process.argv[3] || "Contraseña123!";

async function testPasswordVerification() {
  const client = new Client(dbConfig);

  try {
    console.log("Conectando a la base de datos...");
    await client.connect();
    console.log("Conexión exitosa a la base de datos");

    // Obtener el hash almacenado para el usuario de prueba
    const { rows } = await client.query(
      'SELECT id, "passwordHash" FROM users WHERE email = $1',
      [testEmail]
    );

    if (rows.length === 0) {
      console.error(`Usuario no encontrado: ${testEmail}`);
      return;
    }

    const { id, passwordHash } = rows[0];
    console.log(`Usuario encontrado: ${testEmail} (ID: ${id})`);
    console.log(`Hash almacenado: ${passwordHash}`);

    // Determinar el tipo de hash y verificar
    let isValid = false;

    if (passwordHash.startsWith(BCRYPT_PREFIX)) {
      console.log("El hash tiene prefijo bcrypt:");
      const actualHash = passwordHash.substring(BCRYPT_PREFIX.length);
      console.log(`Hash sin prefijo: ${actualHash}`);
      isValid = await bcrypt.compare(testPassword, actualHash);
    } else if (passwordHash.startsWith("$2")) {
      console.log("El hash está en formato bcrypt estándar");
      isValid = await bcrypt.compare(testPassword, passwordHash);
    } else {
      console.log(
        "El hash está en un formato desconocido, no se puede verificar"
      );
      return;
    }

    // Mostrar resultado
    if (isValid) {
      console.log("\n✅ VERIFICACIÓN EXITOSA: La contraseña es válida");
    } else {
      console.log("\n❌ VERIFICACIÓN FALLIDA: La contraseña no es válida");
    }

    // Crear un nuevo hash con bcrypt para demostración
    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(testPassword, salt);
    console.log("\nNuevo hash bcrypt generado para demostración:");
    console.log(newHash);

    // Verificar el nuevo hash
    const newVerify = await bcrypt.compare(testPassword, newHash);
    console.log(
      `Verificación del nuevo hash: ${newVerify ? "Exitosa" : "Fallida"}`
    );
  } catch (error) {
    console.error("Error al verificar contraseña:", error);
  } finally {
    await client.end();
    console.log("Conexión a la base de datos cerrada");
  }
}

// Ejecutar la prueba
console.log(`Probando verificación de contraseña para: ${testEmail}`);
console.log("---------------------------------------------");
testPasswordVerification().catch(console.error);
