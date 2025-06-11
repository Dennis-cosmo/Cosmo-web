import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "@cosmo/database";
import type { Repository } from "typeorm";
import * as bcryptjs from "bcryptjs";

async function fixPasswordFormat() {
  try {
    console.log("Iniciando script para corregir hash de contraseña...");

    // Iniciar la aplicación NestJS
    const app = await NestFactory.create(AppModule);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // IMPORTANTE: Actualiza estos valores con tu usuario real
    const userEmail = "prueba@correo.com"; // Email del usuario que no puede iniciar sesión
    const currentPassword = "Contraseña123!"; // La contraseña actual que debería funcionar

    // Buscar el usuario
    console.log(`Buscando usuario con email: ${userEmail}`);
    const user = await userRepository.findOne({ where: { email: userEmail } });

    if (!user) {
      console.error(`Error: Usuario con email ${userEmail} no encontrado`);
      await app.close();
      return;
    }

    console.log(`Usuario encontrado: ${user.email}, ID: ${user.id}`);
    console.log(`Hash actual en la BD: ${user.passwordHash}`);

    // Generar un nuevo hash sin prefijo
    console.log(
      `\nGenerando nuevo hash para la contraseña: ${currentPassword}`
    );
    const salt = await bcryptjs.genSalt(12);
    const hash = await bcryptjs.hash(currentPassword, salt);
    console.log(`Nuevo hash sin prefijo: ${hash}`);

    // Almacenar hash directamente sin prefijo
    console.log(
      `\nActualizando la contraseña en la base de datos (sin prefijo bcrypt:)...`
    );
    await userRepository.update(user.id, { passwordHash: hash });

    // Verificar que se actualizó correctamente
    const updatedUser = await userRepository.findOne({
      where: { id: user.id },
    });
    if (!updatedUser) {
      throw new Error(`User with id ${user.id} not found`);
    }
    console.log(`Usuario actualizado. Nuevo hash: ${updatedUser.passwordHash}`);

    // Verificar que la validación funciona
    const isValid = await bcryptjs.compare(
      currentPassword,
      updatedUser.passwordHash
    );
    console.log(
      `\nVerificación de contraseña: ${isValid ? "EXITOSA ✅" : "FALLIDA ❌"}`
    );

    if (isValid) {
      console.log(`
      =============================================
      ¡CONTRASEÑA ACTUALIZADA CORRECTAMENTE!
      
      Usuario: ${userEmail}
      Contraseña: ${currentPassword}
      
      La contraseña se ha guardado con el formato
      correcto para bcryptjs. Ahora deberías poder
      iniciar sesión normalmente.
      =============================================
      `);
    } else {
      console.error(`
      ¡ERROR! La verificación de la contraseña ha fallado.
      Por favor, verifica que la contraseña ingresada es correcta.
      `);
    }

    await app.close();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
  }
}

fixPasswordFormat()
  .then(() => console.log("Script completado"))
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error en el script: ${errorMessage}`);
  });
