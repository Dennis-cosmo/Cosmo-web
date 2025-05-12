import * as bcryptjs from "bcryptjs";

/**
 * Script simple para probar la funcionalidad de bcrypt
 * y verificar que las funciones de hash y comparación funcionan correctamente
 */
async function testBcryptFunctionality() {
  console.log("=== Diagnóstico del Sistema de Autenticación ===");

  // Valores de prueba
  const plainPassword = "Contraseña123!";

  // 1. Generar hash con prefijo bcrypt:
  console.log("\n1. Prueba de generación de hash con prefijo");
  const salt = await bcryptjs.genSalt(12);
  const prefixedHash = "bcrypt:" + (await bcryptjs.hash(plainPassword, salt));
  console.log(`Password original: ${plainPassword}`);
  console.log(`Hash con prefijo: ${prefixedHash}`);

  // 2. Probar comparación directa (fallará debido al prefijo)
  console.log(
    "\n2. Prueba de comparación directa con hash prefijado (debe fallar)"
  );
  try {
    const directCompareResult = await bcryptjs.compare(
      plainPassword,
      prefixedHash
    );
    console.log(`Resultado (esperado falso): ${directCompareResult}`);
  } catch (error) {
    console.log(
      `Error esperado: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // 3. Quitar prefijo y probar comparación
  console.log("\n3. Prueba de comparación quitando el prefijo");
  const actualHash = prefixedHash.startsWith("bcrypt:")
    ? prefixedHash.substring(7)
    : prefixedHash;

  try {
    const isValid = await bcryptjs.compare(plainPassword, actualHash);
    console.log(
      `Resultado después de quitar prefijo: ${isValid ? "VÁLIDO ✓" : "INVÁLIDO ✗"}`
    );
  } catch (error) {
    console.log(
      `Error inesperado: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // 4. Generar hash estándar (sin prefijo)
  console.log("\n4. Prueba de generación y validación de hash estándar");
  const standardHash = await bcryptjs.hash(plainPassword, salt);
  console.log(`Hash estándar generado: ${standardHash}`);

  const isStandardValid = await bcryptjs.compare(plainPassword, standardHash);
  console.log(
    `Validación de hash estándar: ${isStandardValid ? "VÁLIDO ✓" : "INVÁLIDO ✗"}`
  );

  console.log("\n=== Recomendaciones ===");
  console.log(
    "1. Eliminar el prefijo 'bcrypt:' de todos los hashes en la base de datos"
  );
  console.log(
    "2. Asegurar que el servicio de autenticación maneja correctamente el formato"
  );
  console.log("3. Para nuevos usuarios, almacenar los hashes sin prefijo");
}

// Ejecutar el test
testBcryptFunctionality()
  .then(() => console.log("\nDiagnóstico completado."))
  .catch((error) => {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  });
