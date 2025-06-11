import * as bcryptjs from "bcryptjs";
import { execSync } from "child_process";

// Credenciales de prueba
const TEST_CREDENTIALS = {
  email: "prueba@test.com",
  password: "Contraseña123!",
};

/**
 * Script para verificar directamente la contraseña con bcrypt
 * sin depender de NestJS ni otros servicios
 */
async function verifyPassword() {
  console.log("=== Verificación de Contraseña con bcrypt ===");
  console.log(`Email: ${TEST_CREDENTIALS.email}`);
  console.log(`Contraseña: ${TEST_CREDENTIALS.password}`);

  try {
    // Obtener el hash de la base de datos
    console.log("\nObteniendo hash de la base de datos...");
    const command = `docker exec cosmo-postgres psql -U postgres -d cosmo -t -c "SELECT \\"passwordHash\\" FROM users WHERE email = '${TEST_CREDENTIALS.email}';"`;

    const output = execSync(command).toString().trim();

    if (!output) {
      throw new Error(`No se encontró el usuario ${TEST_CREDENTIALS.email}`);
    }

    const hashFromDb = output.trim();
    console.log(`Hash en DB: "${hashFromDb}"`);

    // Verificar si el hash tiene el formato correcto
    if (!hashFromDb.startsWith("$2")) {
      if (hashFromDb.startsWith("bcrypt:")) {
        console.log(
          "⚠️ El hash tiene el prefijo 'bcrypt:', lo quitaremos para la prueba"
        );
        const cleanHash = hashFromDb.substring(7);
        console.log(`Hash limpio: ${cleanHash}`);

        // Probar con el hash limpio
        const isValidClean = await bcryptjs.compare(
          TEST_CREDENTIALS.password,
          cleanHash
        );
        console.log(
          `Resultado sin prefijo: ${isValidClean ? "✅ VÁLIDO" : "❌ INVÁLIDO"}`
        );
      } else {
        console.log("⚠️ El hash no tiene el formato bcrypt estándar");
      }
    } else {
      // El hash tiene el formato correcto, probar directamente
      console.log("Hash en formato bcrypt estándar, probando directamente...");

      // 1. Probar con la contraseña original
      console.log("\n1. Verificando con la contraseña original");
      const isValid = await bcryptjs.compare(
        TEST_CREDENTIALS.password,
        hashFromDb
      );
      console.log(`Resultado: ${isValid ? "✅ VÁLIDO" : "❌ INVÁLIDO"}`);

      // 2. Probar con variaciones por si hay problemas de codificación
      console.log(
        "\n2. Verificando con variaciones por posibles problemas de codificación"
      );
      // Probar sin caracteres especiales
      const noSpecialChars = TEST_CREDENTIALS.password.replace(
        /[ñÑáéíóúÁÉÍÓÚ]/g,
        (char) => {
          const replacements = {
            ñ: "n",
            Ñ: "N",
            á: "a",
            é: "e",
            í: "i",
            ó: "o",
            ú: "u",
            Á: "A",
            É: "E",
            Í: "I",
            Ó: "O",
            Ú: "U",
          };
          return replacements[char as keyof typeof replacements] || char;
        }
      );

      if (noSpecialChars !== TEST_CREDENTIALS.password) {
        console.log(`Probando sin caracteres especiales: "${noSpecialChars}"`);
        const isValidNoSpecial = await bcryptjs.compare(
          noSpecialChars,
          hashFromDb
        );
        console.log(
          `Resultado: ${isValidNoSpecial ? "✅ VÁLIDO" : "❌ INVÁLIDO"}`
        );
      }

      // 3. Generar un nuevo hash para la misma contraseña y comparar
      console.log("\n3. Generando nuevo hash para la misma contraseña");
      const salt = await bcryptjs.genSalt(12);
      const newHash = await bcryptjs.hash(TEST_CREDENTIALS.password, salt);
      console.log(`Nuevo hash: ${newHash}`);

      // Verificar el nuevo hash (debería ser válido)
      const isNewHashValid = await bcryptjs.compare(
        TEST_CREDENTIALS.password,
        newHash
      );
      console.log(
        `Validación del nuevo hash: ${isNewHashValid ? "✅ VÁLIDO" : "❌ INVÁLIDO"}`
      );

      // Actualizar el hash en la base de datos si es necesario
      if (!isValid && isNewHashValid) {
        console.log(
          "\n❗ El hash actual no es válido pero el nuevo sí. Actualizando en la base de datos..."
        );
        const updateCommand = `docker exec cosmo-postgres psql -U postgres -d cosmo -c "UPDATE users SET \\"passwordHash\\" = '${newHash}' WHERE email = '${TEST_CREDENTIALS.email}';"`;

        execSync(updateCommand);
        console.log(
          "✅ Hash actualizado en la base de datos. Intenta iniciar sesión nuevamente."
        );
      } else if (!isValid) {
        console.log("\n❓ Ninguna variación funciona. Posibles soluciones:");
        console.log("1. Resetear manualmente la contraseña");
        console.log("2. Revisar cómo se está generando el hash en el registro");
        console.log(
          "3. Verificar si hay otros problemas en el flujo de autenticación"
        );
      }
    }
  } catch (error) {
    console.error(
      "\n❌ ERROR:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Ejecutar verificación
verifyPassword()
  .then(() => console.log("\nVerificación completada."))
  .catch((err) =>
    console.error(
      "Error fatal:",
      err instanceof Error ? err.message : String(err)
    )
  );
