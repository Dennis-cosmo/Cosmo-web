import * as bcryptjs from "bcryptjs";

// Prefijos para identificar hashes
const BCRYPT_PREFIX = "bcrypt:";

// Datos de prueba - actualiza estas variables con tus datos reales
const realPasswordHash =
  "bcrypt:$2b$12$KHijJdzV9hpNwfwXehgdZ.HDYgOb0G0LZ946vuUl99mMFXMRsCqhy"; // Hash almacenado en la BD
const passwordToTest = "Contraseña123!"; // Contraseña que estás intentando usar

async function testPasswordValidation() {
  console.log("=== Prueba de validación de contraseñas ===");
  console.log(`Hash almacenado: ${realPasswordHash}`);
  console.log(`Contraseña a probar: ${passwordToTest}`);
  console.log("\n1. Analizando formato del hash");

  if (realPasswordHash.startsWith(BCRYPT_PREFIX)) {
    console.log("✅ El hash tiene el prefijo bcrypt: correcto");

    // Extraer el hash real sin el prefijo
    const actualHash = realPasswordHash.substring(BCRYPT_PREFIX.length);
    console.log(`Hash sin prefijo: ${actualHash}`);

    // Verificar que el hash tiene formato válido
    if (actualHash.startsWith("$2")) {
      console.log("✅ El formato del hash es válido ($2...)");

      try {
        // Intentar validar la contraseña
        console.log("\n2. Probando validación directa con bcryptjs");
        console.log("Comparando la contraseña con el hash (sin prefijo)...");
        const isValid = await bcryptjs.compare(passwordToTest, actualHash);
        console.log(`Resultado: ${isValid ? "VÁLIDO ✅" : "INVÁLIDO ❌"}`);

        if (!isValid) {
          // Si falla, intentar con diferentes variaciones
          console.log("\n3. Probando variaciones:");

          // Generar un nuevo hash con la misma contraseña para comparar
          const salt = await bcryptjs.genSalt(12);
          const newHash = await bcryptjs.hash(passwordToTest, salt);
          console.log(`- Nuevo hash generado: ${newHash}`);
          console.log(
            `- El formato del nuevo hash es: ${newHash.substring(0, 7)}...`
          );

          // Comprobar si hay problemas de codificación
          console.log("\n4. Verificando posibles problemas de codificación:");
          const asciiPassword = passwordToTest.normalize("NFKC");
          console.log(`- Contraseña normalizada: ${asciiPassword}`);
          const isValidNormalized = await bcryptjs.compare(
            asciiPassword,
            actualHash
          );
          console.log(
            `- Resultado con normalización: ${isValidNormalized ? "VÁLIDO ✅" : "INVÁLIDO ❌"}`
          );

          // Probar con errores comunes
          console.log("\n5. Probando posibles errores comunes:");
          console.log("- Resultado con hash completo (error común):");
          try {
            const resultWithPrefix = await bcryptjs.compare(
              passwordToTest,
              realPasswordHash
            );
            console.log(`  ${resultWithPrefix ? "VÁLIDO ✅" : "INVÁLIDO ❌"}`);
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            console.log(`  ERROR: ${errorMessage}`);
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(`⚠️ Error durante la validación: ${errorMessage}`);
      }
    } else {
      console.log(
        `❌ El hash no tiene un formato bcrypt válido: ${actualHash.substring(0, 10)}...`
      );
    }
  } else {
    console.log(
      `❌ El hash no tiene el prefijo bcrypt: ${realPasswordHash.substring(0, 10)}...`
    );
  }

  // Sugerencias finales
  console.log("\n=== Recomendaciones ===");
  console.log(
    "1. Verifica que la contraseña que intentas usar coincide exactamente con la registrada"
  );
  console.log(
    "2. Elimina espacios adicionales o caracteres invisibles en la contraseña"
  );
  console.log(
    "3. Si persisten los problemas, reinicia la contraseña con el script fix-password.ts"
  );
}

// Ejecutar la prueba
testPasswordValidation()
  .then(() => console.log("\nPrueba completada"))
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error en la ejecución: ${errorMessage}`);
  });
