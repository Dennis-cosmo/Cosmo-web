import * as bcryptjs from "bcryptjs";
import { createConnection } from "typeorm";
import { User } from "@cosmo/database";
import { dataSource } from "@cosmo/database";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Cargar variables de entorno desde el directorio raíz del proyecto
const findRootDir = () => {
  let currentDir = process.cwd();
  // Subir en la jerarquía de directorios hasta encontrar el archivo .env
  while (currentDir !== "/") {
    const envPath = path.join(currentDir, ".env");
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    currentDir = path.dirname(currentDir);
  }
  return path.resolve(process.cwd(), ".env"); // Fallback
};

const dotenvPath = findRootDir();
dotenv.config({ path: dotenvPath });
console.log("Cargando variables de entorno desde:", dotenvPath);
console.log("DATABASE_URL:", process.env.DATABASE_URL || "No definido");

// Configuración manual como fallback si la variable de entorno no existe
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/cosmo";

// Configuración del usuario de prueba
const TEST_USER = {
  email: "prueba@test.com",
  password: "Contraseña123!",
  firstName: "Usuario",
  lastName: "Prueba",
  companyName: "Empresa de Prueba",
};

async function setupTestUser() {
  console.log("=== Configuración de Usuario de Prueba ===");
  console.log(`Email: ${TEST_USER.email}`);
  console.log(`Contraseña: ${TEST_USER.password}`);

  let connection;

  try {
    // Intentar conectar a la base de datos
    console.log("\nConectando a la base de datos...");
    console.log("Configuración de conexión:");
    console.log(`- Tipo: postgres`);
    console.log(`- URL: ${DATABASE_URL}`);

    // Crear conexión
    connection = await createConnection({
      type: "postgres",
      url: DATABASE_URL,
      entities: [User],
    });

    console.log("✅ Conexión exitosa a la base de datos");

    // Buscar si el usuario ya existe
    const userRepository = connection.getRepository(User);
    let user = await userRepository.findOne({
      where: { email: TEST_USER.email },
    });

    if (user) {
      console.log(`\n✅ Usuario encontrado. ID: ${user.id}`);
      console.log(`Hash actual: ${user.passwordHash}`);

      // Verificar si el hash tiene prefijo
      if (user.passwordHash.startsWith("bcrypt:")) {
        // Quitar el prefijo
        const actualHash = user.passwordHash.substring(7);
        console.log(`Hash sin prefijo: ${actualHash}`);

        // Actualizar el hash
        await userRepository.update(user.id, { passwordHash: actualHash });
        console.log("✅ Prefijo 'bcrypt:' eliminado del hash");

        // Verificar la actualización
        user = await userRepository.findOne({ where: { id: user.id } });
        console.log(`Nuevo hash: ${user.passwordHash}`);
      } else if (user.passwordHash.startsWith("$2")) {
        console.log("✅ El hash ya está en formato correcto (sin prefijo)");
      } else {
        console.log(
          "⚠️ El formato del hash no es reconocido, generando uno nuevo"
        );

        // Generar nuevo hash
        const salt = await bcryptjs.genSalt(12);
        const newHash = await bcryptjs.hash(TEST_USER.password, salt);

        // Actualizar usuario
        await userRepository.update(user.id, { passwordHash: newHash });
        console.log(`✅ Hash actualizado: ${newHash}`);
      }
    } else {
      console.log("\n⚠️ Usuario no encontrado, creando uno nuevo");

      // Generar hash para la contraseña
      const salt = await bcryptjs.genSalt(12);
      const passwordHash = await bcryptjs.hash(TEST_USER.password, salt);

      // Crear nuevo usuario
      const newUser = new User();
      const userWithFields = newUser as User & Record<string, any>;

      userWithFields.email = TEST_USER.email;
      userWithFields.passwordHash = passwordHash;
      userWithFields.firstName = TEST_USER.firstName;
      userWithFields.lastName = TEST_USER.lastName;
      userWithFields.companyName = TEST_USER.companyName;
      userWithFields.isAdmin = false;
      userWithFields.status = "active";
      userWithFields.emailVerified = true;
      userWithFields.onboardingCompleted = true;

      // Guardar usuario
      const savedUser = await userRepository.save(userWithFields);
      console.log(`✅ Usuario creado. ID: ${savedUser.id}`);
      console.log(`Hash: ${savedUser.passwordHash}`);
    }

    // Probar la autenticación
    console.log("\nVerificando autenticación...");
    const userForAuth = await userRepository.findOne({
      where: { email: TEST_USER.email },
    });

    if (userForAuth) {
      const isValid = await bcryptjs.compare(
        TEST_USER.password,
        userForAuth.passwordHash
      );

      console.log(
        `Resultado de autenticación: ${isValid ? "✅ VÁLIDA" : "❌ INVÁLIDA"}`
      );

      if (isValid) {
        console.log("\n=== ¡USUARIO LISTO PARA INICIAR SESIÓN! ===");
        console.log(`Email: ${TEST_USER.email}`);
        console.log(`Contraseña: ${TEST_USER.password}`);
      } else {
        console.log(
          "\n❌ ERROR: La verificación falló. Revisa el formato del hash."
        );
      }
    }
  } catch (error) {
    console.error(
      `\n❌ ERROR: ${error instanceof Error ? error.message : String(error)}`
    );

    if (error instanceof Error && error.stack) {
      console.error("Detalles del error:");
      console.error(error.stack);
    }
  } finally {
    // Cerrar conexión
    if (connection && connection.isConnected) {
      await connection.close();
      console.log("\nConexión a la base de datos cerrada.");
    }
  }
}

// Ejecutar el script
setupTestUser()
  .then(() => console.log("\nScript de configuración completado."))
  .catch((error) => {
    console.error(
      `Error fatal en el script: ${error instanceof Error ? error.message : String(error)}`
    );
  });
