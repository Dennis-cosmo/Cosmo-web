import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@cosmo/database";
import { Repository } from "typeorm";
import * as bcryptjs from "bcryptjs";

// Prefijo para identificar hashes bcrypt
const BCRYPT_PREFIX = "bcrypt:";

async function fixPassword() {
  try {
    console.log("Iniciando script para arreglar contraseña de usuario...");

    // Iniciar la aplicación NestJS
    const app = await NestFactory.create(AppModule);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // IMPORTANTE: Configura estos valores
    const userEmail = "prueba@correo.com"; // Cambia esto al email del usuario
    const newPassword = "Nueva123!"; // Nueva contraseña segura

    console.log(`Buscando usuario con email: ${userEmail}`);
    const user = await userRepository.findOne({ where: { email: userEmail } });

    if (!user) {
      console.error(`Error: Usuario con email ${userEmail} no encontrado`);
      await app.close();
      return;
    }

    console.log(`Usuario encontrado: ${user.email}, ID: ${user.id}`);
    console.log(`Hash actual: ${user.passwordHash}`);

    // Generar nuevo hash con bcrypt
    console.log(`Generando nuevo hash para la contraseña: ${newPassword}`);
    const salt = await bcryptjs.genSalt(12);
    const hash = await bcryptjs.hash(newPassword, salt);
    const newPasswordHash = BCRYPT_PREFIX + hash;

    // Actualizar la contraseña en la base de datos
    console.log("Actualizando contraseña en la base de datos...");
    await userRepository.update(user.id, { passwordHash: newPasswordHash });

    // Verificar que se actualizó correctamente
    const updatedUser = await userRepository.findOne({
      where: { id: user.id },
    });
    console.log(`Usuario actualizado. Nuevo hash: ${updatedUser.passwordHash}`);

    // Verificar que la contraseña se puede validar con bcryptjs
    const actualHash = updatedUser.passwordHash.substring(BCRYPT_PREFIX.length);
    const isValid = await bcryptjs.compare(newPassword, actualHash);
    console.log(
      `Verificación de contraseña: ${isValid ? "EXITOSA" : "FALLIDA"}`
    );

    if (isValid) {
      console.log(`
      ====================================================================
      ¡CONTRASEÑA ACTUALIZADA CON ÉXITO!
      
      Usuario: ${userEmail}
      Nueva contraseña: ${newPassword}
      
      Puedes usar estas credenciales para iniciar sesión en la aplicación.
      ====================================================================
      `);
    } else {
      console.error(
        "Error: La verificación de contraseña ha fallado. Revisa la configuración de hash."
      );
    }

    await app.close();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error al actualizar la contraseña: ${errorMessage}`);
  }
}

fixPassword()
  .then(() => console.log("Script completado"))
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error en el script: ${errorMessage}`);
  });
