import * as bcryptjs from "bcryptjs";
import { createConnection } from "typeorm";
import { User } from "@cosmo/database";
import { dataSource } from "@cosmo/database";

// Configuración del usuario a modificar
const USER_EMAIL = "prueba@correo.com"; // Cambia al email del usuario real
const NEW_PASSWORD = "Contraseña123!"; // Nueva contraseña a establecer

async function resetUserPassword() {
  console.log("=== Reseteo de Contraseña ===");
  console.log(`Usuario: ${USER_EMAIL}`);
  console.log(`Nueva contraseña: ${NEW_PASSWORD}`);

  let connection;

  try {
    // Intentar conectar a la base de datos
    console.log("\nConectando a la base de datos...");

    // Para diagnóstico, mostrar la configuración de conexión
    console.log("Configuración de conexión:");
    console.log(`- Tipo: ${dataSource.options.type}`);
    // Mostrar otras propiedades de la base de datos según el tipo
    console.log(`- Base de datos: ${dataSource.options.database}`);

    // Crear conexión
    connection = await createConnection({
      ...dataSource.options,
      entities: dataSource.options.entities,
    } as any);

    console.log("✅ Conexión exitosa a la base de datos");

    // Buscar el usuario
    const userRepository = connection.getRepository(User);
    console.log(`\nBuscando usuario con email: ${USER_EMAIL}`);

    const user = await userRepository.findOne({ where: { email: USER_EMAIL } });

    if (!user) {
      console.log(`❌ Usuario con email ${USER_EMAIL} no encontrado`);
      return;
    }

    console.log(`✅ Usuario encontrado. ID: ${user.id}`);
    console.log(`Hash actual: ${user.passwordHash}`);

    // Generar nuevo hash de contraseña (sin prefijo)
    console.log("\nGenerando nuevo hash para la contraseña...");
    const salt = await bcryptjs.genSalt(12);
    const newHash = await bcryptjs.hash(NEW_PASSWORD, salt);
    console.log(`Nuevo hash: ${newHash}`);

    // Actualizar en la base de datos
    console.log("\nActualizando contraseña en la base de datos...");
    await userRepository.update(user.id, { passwordHash: newHash });

    // Verificar que se actualizó correctamente
    const updatedUser = await userRepository.findOne({
      where: { id: user.id },
    });
    console.log(
      `✅ Usuario actualizado. Nuevo hash: ${updatedUser.passwordHash}`
    );

    // Probar la nueva contraseña
    console.log("\nVerificando que la nueva contraseña funciona...");
    const isValid = await bcryptjs.compare(
      NEW_PASSWORD,
      updatedUser.passwordHash
    );
    console.log(
      `Resultado de verificación: ${isValid ? "✅ VÁLIDA" : "❌ INVÁLIDA"}`
    );

    if (isValid) {
      console.log("\n=== ¡CONTRASEÑA ACTUALIZADA EXITOSAMENTE! ===");
      console.log(`Usuario: ${USER_EMAIL}`);
      console.log(`Contraseña: ${NEW_PASSWORD}`);
      console.log(
        "Ahora deberías poder iniciar sesión con estas credenciales."
      );
    } else {
      console.log("\n❌ ERROR: La verificación de la nueva contraseña falló.");
    }
  } catch (error) {
    console.error(
      `\n❌ ERROR: ${error instanceof Error ? error.message : String(error)}`
    );

    // Mostrar más detalles del error si es posible
    if (error instanceof Error && error.stack) {
      console.error("Detalles del error:");
      console.error(error.stack);
    }
  } finally {
    // Cerrar conexión si está abierta
    if (connection && connection.isConnected) {
      await connection.close();
      console.log("\nConexión a la base de datos cerrada.");
    }
  }
}

// Ejecutar el script
resetUserPassword()
  .then(() => console.log("\nScript de reseteo de contraseña completado."))
  .catch((error) => {
    console.error(
      `Error fatal en el script: ${error instanceof Error ? error.message : String(error)}`
    );
  });
