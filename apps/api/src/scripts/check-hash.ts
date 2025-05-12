import * as bcryptjs from "bcryptjs";

// Prefijos para identificar hashes
const BCRYPT_PREFIX = "bcrypt:";
const SHA256_PREFIX = "sha256:";

// Ejemplo de un hash almacenado en la base de datos
const storedHash =
  "bcrypt:$2b$12$pi3k2fERvSBC4hDyfEYyzunS2.jhmXuf6xZtlWBdQatfo2T0HVyy6";

// Contraseña de prueba
const testPassword = "Contraseña123!";

async function testBcryptValidation() {
  console.log(`Analizando hash: ${storedHash}`);

  if (storedHash.startsWith(BCRYPT_PREFIX)) {
    console.log("Formato detectado: bcrypt con prefijo");
    const actualHash = storedHash.substring(BCRYPT_PREFIX.length);
    console.log(`Hash bcrypt sin prefijo: ${actualHash}`);

    try {
      // Validar la contraseña de prueba
      console.log(`\nProbando validación con contraseña: "${testPassword}"`);
      const isValid = await bcryptjs.compare(testPassword, actualHash);
      console.log(
        `Resultado de validación: ${isValid ? "VÁLIDA" : "INVÁLIDA"}`
      );

      // Si la validación falla, probar otras combinaciones
      if (!isValid) {
        console.log("\nProbando otras combinaciones:");

        // Probar sin quitar el prefijo (error común)
        try {
          const isValidWithPrefix = await bcryptjs.compare(
            testPassword,
            storedHash
          );
          console.log(
            `- Con prefijo bcrypt (error común): ${isValidWithPrefix ? "VÁLIDA" : "INVÁLIDA"}`
          );
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.log(`- Con prefijo bcrypt: ERROR - ${errorMessage}`);
        }

        // Generar un nuevo hash con la misma contraseña para comparar formatos
        const salt = await bcryptjs.genSalt(12);
        const newHash = await bcryptjs.hash(testPassword, salt);
        console.log(`\nNuevo hash generado: ${newHash}`);
        console.log(`Formato compatible: ${newHash.startsWith("$2")}`);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error en la validación: ${errorMessage}`);
    }
  } else if (storedHash.startsWith(SHA256_PREFIX)) {
    console.log("Formato detectado: SHA-256 con prefijo");
  } else {
    console.log(`Formato desconocido. Longitud: ${storedHash.length}`);
  }
}

// Ejecutar la prueba
testBcryptValidation()
  .then(() => console.log("Prueba completada"))
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
  });
