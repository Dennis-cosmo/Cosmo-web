import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@cosmo/database";
import { Repository } from "typeorm";
import * as bcryptjs from "bcryptjs";
import { AuthService } from "../auth/auth.service";
import chalk from "chalk";

/**
 * Script de diagnóstico completo para verificar el sistema de autenticación
 * Realiza varias pruebas:
 * 1. Lista los formatos de hash en la base de datos
 * 2. Crea un usuario de prueba
 * 3. Intenta autenticar al usuario con distintos enfoques
 * 4. Verifica que el servicio de autenticación funciona correctamente
 */
async function verifyAuthentication() {
  try {
    console.log(chalk.blue("=== Diagnóstico del Sistema de Autenticación ==="));

    // Iniciar la aplicación NestJS
    console.log(chalk.gray("Iniciando aplicación..."));
    const app = await NestFactory.create(AppModule, { logger: false });
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const authService = app.get(AuthService);

    console.log(chalk.gray("Aplicación iniciada correctamente.\n"));

    // 1. Analizar formatos de hash actuales
    console.log(
      chalk.blue("1. Análisis de formatos de hash en la base de datos")
    );
    const users = await userRepository.find();
    console.log(chalk.gray(`Total de usuarios: ${users.length}`));

    let bcryptPrefixCount = 0;
    let bcryptStandardCount = 0;
    let sha256Count = 0;
    let unknownCount = 0;

    for (const user of users) {
      const hash = user.passwordHash;
      if (hash.startsWith("bcrypt:")) {
        bcryptPrefixCount++;
      } else if (hash.startsWith("$2")) {
        bcryptStandardCount++;
      } else if (hash.startsWith("sha256:")) {
        sha256Count++;
      } else {
        unknownCount++;
      }
    }

    console.log(
      `- Hashes con formato bcrypt estándar (sin prefijo): ${chalk.green(bcryptStandardCount)}`
    );
    console.log(
      `- Hashes con prefijo bcrypt:: ${chalk.yellow(bcryptPrefixCount)}`
    );
    console.log(`- Hashes con prefijo sha256:: ${chalk.red(sha256Count)}`);
    console.log(`- Hashes con formato desconocido: ${chalk.red(unknownCount)}`);

    // 2. Crear usuario de prueba
    console.log(chalk.blue("\n2. Creando usuario de prueba"));

    // Generar email y contraseña para prueba
    const testEmail = `test-auth-${Date.now()}@example.com`;
    const testPassword = "TestPassword123!";

    // Crear hash con formato bcrypt estándar
    const salt = await bcryptjs.genSalt(12);
    const standardHash = await bcryptjs.hash(testPassword, salt);

    // Crear usuario con formato estándar
    const testUser = new User();
    testUser.email = testEmail;
    testUser.firstName = "Test";
    testUser.lastName = "User";
    testUser.passwordHash = standardHash;
    testUser.status = "active";
    testUser.isAdmin = false;

    const savedUser = await userRepository.save(testUser);
    console.log(
      chalk.green(`Usuario de prueba creado con ID: ${savedUser.id}`)
    );
    console.log(`- Email: ${testEmail}`);
    console.log(`- Contraseña: ${testPassword}`);
    console.log(`- Hash almacenado: ${standardHash}`);

    // 3. Probar autenticación directa con bcryptjs
    console.log(chalk.blue("\n3. Prueba de validación directa con bcryptjs"));

    try {
      const directTestResult = await bcryptjs.compare(
        testPassword,
        standardHash
      );
      console.log(
        `- Resultado validación directa: ${directTestResult ? chalk.green("VÁLIDO ✓") : chalk.red("INVÁLIDO ✗")}`
      );

      if (!directTestResult) {
        console.log(
          chalk.red("¡ERROR! La validación directa con bcryptjs falló.")
        );
      }
    } catch (error) {
      console.log(
        chalk.red(
          `Error en validación directa: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }

    // 4. Probar servicio de autenticación
    console.log(chalk.blue("\n4. Prueba del servicio de autenticación"));

    try {
      // Intentar login con credenciales correctas
      const authResult = await authService.validateUser(
        testEmail,
        testPassword
      );

      if (authResult && authResult.id === savedUser.id) {
        console.log(
          chalk.green("✓ Autenticación exitosa con el servicio AuthService")
        );
      } else {
        console.log(
          chalk.red("✗ La autenticación falló con el servicio AuthService")
        );
      }

      // Intentar con contraseña incorrecta
      try {
        await authService.validateUser(testEmail, "ContraseñaIncorrecta123!");
        console.log(
          chalk.red(
            "✗ ERROR: La autenticación no debería funcionar con contraseña incorrecta"
          )
        );
      } catch (error) {
        console.log(
          chalk.green(
            "✓ Correcto: La autenticación rechazó credenciales inválidas"
          )
        );
      }
    } catch (error) {
      console.log(
        chalk.red(
          `Error al usar el servicio de autenticación: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }

    // 5. Limpiar - Eliminar usuario de prueba
    await userRepository.delete(savedUser.id);
    console.log(chalk.gray(`\nUsuario de prueba eliminado correctamente.`));

    console.log(chalk.blue("\n=== Diagnóstico completado ==="));

    // Cerrar la aplicación
    await app.close();
  } catch (error) {
    console.error(
      chalk.red(
        `Error en verificación: ${error instanceof Error ? error.message : String(error)}`
      )
    );
  }
}

// Ejecutar diagnóstico
verifyAuthentication()
  .then(() => console.log(chalk.green("\nVerificación completada.")))
  .catch((error) => {
    console.error(
      chalk.red(
        `Error fatal: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    process.exit(1);
  });
