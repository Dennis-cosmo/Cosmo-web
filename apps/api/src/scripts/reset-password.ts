import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@cosmo/database";
import { Repository } from "typeorm";
import * as bcryptjs from "bcryptjs";
import * as crypto from "crypto";

// Prefijos para identificar hashes
const BCRYPT_PREFIX = "bcrypt:";
const SHA256_PREFIX = "sha256:";

async function runPasswordOperation() {
  const app = await NestFactory.create(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  // IMPORTANTE: Ajusta estos valores según la operación deseada
  const userEmail = "prueba@correo.com"; // Cambia esto al email de un usuario real
  const newPlainPassword = "Contraseña123!"; // Nueva contraseña segura

  // Modo: true para resetear la contraseña, false para solo mostrar información
  const shouldResetPassword = false; // Cambia a true si deseas resetear la contraseña

  // Buscar el usuario
  const user = await userRepository.findOne({ where: { email: userEmail } });

  if (!user) {
    console.error(`Error: Usuario con email ${userEmail} no encontrado`);
    await app.close();
    return;
  }

  console.log(`Usuario encontrado: ${user.email}, ID: ${user.id}`);
  console.log(`Password Hash actual: ${user.passwordHash}`);

  // Analizar el formato del hash actual
  if (user.passwordHash.startsWith(BCRYPT_PREFIX)) {
    console.log(`Formato detectado: bcrypt con prefijo`);
    const actualHash = user.passwordHash.substring(BCRYPT_PREFIX.length);
    console.log(`Hash bcrypt sin prefijo: ${actualHash.substring(0, 20)}...`);
    console.log(`Formato válido para bcryptjs: ${actualHash.startsWith("$2")}`);

    // Validar una contraseña de prueba
    console.log(
      `\nProbando validación con contraseña de prueba: "${newPlainPassword}"`
    );
    const isValid = await bcryptjs.compare(newPlainPassword, actualHash);
    console.log(`Resultado de validación: ${isValid ? "VÁLIDA" : "INVÁLIDA"}`);
  } else if (user.passwordHash.startsWith(SHA256_PREFIX)) {
    console.log(`Formato detectado: SHA-256 con prefijo`);
    const actualHash = user.passwordHash.substring(SHA256_PREFIX.length);
    console.log(`Hash SHA-256 sin prefijo: ${actualHash}`);
  } else if (
    user.passwordHash.length === 64 &&
    !/[^a-f0-9]/.test(user.passwordHash)
  ) {
    console.log(`Formato detectado: Hash simple SHA-256 (sin prefijo)`);
    console.log(
      `Este formato puede causar problemas con la autenticación actual`
    );
  } else {
    console.log(`Formato desconocido. Longitud: ${user.passwordHash.length}`);
  }

  // Resetear la contraseña si se solicita
  if (shouldResetPassword) {
    try {
      // Generar nuevo hash con bcrypt
      const salt = await bcryptjs.genSalt(12);
      const hash = await bcryptjs.hash(newPlainPassword, salt);
      const newPasswordHash = BCRYPT_PREFIX + hash;

      // Actualizar en la base de datos
      await userRepository.update(user.id, { passwordHash: newPasswordHash });

      // Verificar que se actualizó correctamente
      const updatedUser = await userRepository.findOne({
        where: { id: user.id },
      });

      console.log("¡Contraseña actualizada con éxito!");
      console.log(`Nuevo Password Hash: ${updatedUser.passwordHash}`);

      // Verificar que podemos validar la contraseña correctamente
      const isValid = await bcryptjs.compare(
        newPlainPassword,
        updatedUser.passwordHash.substring(BCRYPT_PREFIX.length)
      );

      console.log(
        `Validación de nueva contraseña: ${isValid ? "EXITOSA" : "FALLIDA"}`
      );

      // Generar hash en otros formatos para probar
      console.log("\nHashes equivalentes para pruebas:");
      console.log(
        `Hash SHA-256 simple: ${crypto.createHash("sha256").update(newPlainPassword).digest("hex")}`
      );
      console.log(
        `Hash SHA-256 con prefijo: ${SHA256_PREFIX}${crypto.createHash("sha256").update(newPlainPassword).digest("hex")}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error al actualizar la contraseña: ${errorMessage}`);
    }
  }

  await app.close();
}

runPasswordOperation()
  .then(() => console.log("Script completado"))
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error en el script: ${errorMessage}`);
  });
