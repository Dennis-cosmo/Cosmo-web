import * as bcryptjs from "bcryptjs";

// Constantes
const BCRYPT_PREFIX = "bcrypt:";

// Valores para probar - actualiza estos con valores reales
const STORED_HASH =
  "bcrypt:$2b$12$KHijJdzV9hpNwfwXehgdZ.HDYgOb0G0LZ946vuUl99mMFXMRsCqhy"; // Hash con prefijo
const PASSWORD = "Contraseña123!"; // Contraseña a validar

// Función para simular el proceso de login completo
async function testBcryptAuth() {
  console.log("=== Prueba de Autenticación con bcrypt ===\n");
  console.log(`Contraseña a probar: "${PASSWORD}"`);
  console.log(`Hash almacenado: ${STORED_HASH}`);

  let isValid = false;

  // 1. Caso 1: Hash con prefijo bcrypt: (situación actual)
  console.log("\n--- Caso 1: Hash con prefijo 'bcrypt:' ---");
  if (STORED_HASH.startsWith(BCRYPT_PREFIX)) {
    const actualHash = STORED_HASH.substring(BCRYPT_PREFIX.length);
    console.log(`Hash sin prefijo: ${actualHash}`);

    try {
      // Validar directamente con bcryptjs
      isValid = await bcryptjs.compare(PASSWORD, actualHash);
      console.log(`Resultado: ${isValid ? "✅ VÁLIDO" : "❌ INVÁLIDO"}`);
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // 2. Caso 2: Hash sin prefijo (solución propuesta)
  console.log("\n--- Caso 2: Hash sin prefijo (solución propuesta) ---");
  let normalizedHash = STORED_HASH;
  if (normalizedHash.startsWith(BCRYPT_PREFIX)) {
    normalizedHash = normalizedHash.substring(BCRYPT_PREFIX.length);
  }

  try {
    // Validar con hash normalizado
    const isValidNormalized = await bcryptjs.compare(PASSWORD, normalizedHash);
    console.log(
      `Resultado: ${isValidNormalized ? "✅ VÁLIDO" : "❌ INVÁLIDO"}`
    );
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // 3. Crear un nuevo hash para la misma contraseña
  console.log("\n--- Caso 3: Creación de nuevo hash (referencia) ---");
  try {
    const salt = await bcryptjs.genSalt(12);
    const newHash = await bcryptjs.hash(PASSWORD, salt);
    console.log(`Nuevo hash generado: ${newHash}`);

    // Validar el nuevo hash
    const isNewValid = await bcryptjs.compare(PASSWORD, newHash);
    console.log(
      `Validación de nuevo hash: ${isNewValid ? "✅ VÁLIDO" : "❌ INVÁLIDO"}`
    );
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return isValid;
}

// Ejecutar prueba
testBcryptAuth()
  .then((result) => {
    console.log("\n=== Conclusión ===");
    if (result) {
      console.log(
        "La autenticación funciona correctamente con la implementación actual."
      );
      console.log(
        "✅ Recomendación: Actualizar el formato de hash eliminando el prefijo 'bcrypt:'"
      );
    } else {
      console.log("❌ La autenticación falla con la implementación actual.");
      console.log("Solución recomendada:");
      console.log(
        "1. Eliminar el prefijo 'bcrypt:' de todos los hashes en la base de datos"
      );
      console.log(
        "2. Actualizar el código para validar sin esperar el prefijo"
      );
    }
  })
  .catch((error) => {
    console.error(
      `Error en la prueba: ${error instanceof Error ? error.message : String(error)}`
    );
  });
