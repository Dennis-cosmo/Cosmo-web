import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { AuthService } from "../auth/auth.service";
import * as bcryptjs from "bcryptjs";

const TEST_CREDENTIALS = {
  email: "prueba@test.com",
  password: "Contraseña123!",
};

/**
 * Script para probar directamente el servicio de autenticación
 * Verifica si las credenciales funcionan correctamente y diagnostica problemas
 */
async function testAuthentication() {
  console.log("=== Test del Servicio de Autenticación ===");
  console.log(`Probando credenciales:`);
  console.log(`  Email: ${TEST_CREDENTIALS.email}`);
  console.log(`  Password: ${TEST_CREDENTIALS.password}`);

  try {
    // Iniciar la aplicación NestJS
    console.log("\nIniciando aplicación NestJS...");
    const app = await NestFactory.create(AppModule, {
      logger: ["error", "warn"],
    });

    // Obtener el servicio de autenticación
    const authService = app.get(AuthService);
    console.log("✅ Servicio de autenticación obtenido correctamente");

    // Probar método de validación
    console.log("\n1. Probando AuthService.validateUser()...");
    try {
      const user = await authService.validateUser(
        TEST_CREDENTIALS.email,
        TEST_CREDENTIALS.password
      );

      if (user) {
        console.log("✅ Autenticación exitosa!");
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Nombre: ${user.firstName} ${user.lastName}`);
      } else {
        console.log("❌ Autenticación fallida - usuario no retornado");
      }
    } catch (error) {
      console.error(
        "❌ Error en validateUser():",
        error instanceof Error ? error.message : String(error)
      );
    }

    // Probar método de login
    console.log("\n2. Probando AuthService.login()...");
    try {
      const loginResult = await authService.login({
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password,
      });

      if (loginResult && loginResult.accessToken) {
        console.log("✅ Login exitoso!");
        console.log(`  Token: ${loginResult.accessToken.substring(0, 20)}...`);
        console.log(`  Usuario: ${loginResult.user.email}`);
      } else {
        console.log("❌ Login fallido - no se generó token");
      }
    } catch (error) {
      console.error(
        "❌ Error en login():",
        error instanceof Error ? error.message : String(error)
      );

      // Dar más detalles sobre el posible problema
      if (
        error instanceof Error &&
        (error.message.includes("credenciales incorrectas") ||
          error.message.includes("incorrect"))
      ) {
        console.log("\n🔍 Diagnóstico de problema:");
        console.log(
          "El servicio está rechazando las credenciales a pesar de que el hash parece correcto."
        );
        console.log("Esto puede deberse a:");
        console.log("1. Codificación o caracteres especiales en la contraseña");
        console.log("2. Problema en la comparación del hash en bcrypt");

        // Probar bcrypt directamente
        console.log("\n3. Probando bcrypt directamente...");
        try {
          // Obtener el hash actual
          const hashFromDb =
            "$2b$12$A1f52uyp80KEXOJ/T/8ZcOCzfueZlVGDZTo8h0v5..1STWJc/MQTC";
          console.log(`  Hash en DB: ${hashFromDb}`);

          // Comparar con bcrypt
          const isValid = await bcryptjs.compare(
            TEST_CREDENTIALS.password,
            hashFromDb
          );
          console.log(
            `  Resultado bcrypt.compare: ${isValid ? "✅ VÁLIDO" : "❌ INVÁLIDO"}`
          );

          // Generar un nuevo hash para comparar
          const salt = await bcryptjs.genSalt(12);
          const newHash = await bcryptjs.hash(TEST_CREDENTIALS.password, salt);
          console.log(`  Nuevo hash generado: ${newHash}`);
          console.log(
            `  ¿Los hashes son muy diferentes? ${newHash.substring(0, 10) !== hashFromDb.substring(0, 10) ? "Sí" : "No"}`
          );
        } catch (bcryptError) {
          console.error(
            "  Error en bcrypt:",
            bcryptError instanceof Error
              ? bcryptError.message
              : String(bcryptError)
          );
        }
      }
    }

    await app.close();
  } catch (error) {
    console.error(
      "Error general:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Ejecutar el test
testAuthentication()
  .then(() => console.log("\nTest completado."))
  .catch((err) =>
    console.error(
      "Error fatal:",
      err instanceof Error ? err.message : String(err)
    )
  );
