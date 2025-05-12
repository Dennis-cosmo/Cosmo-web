import * as bcryptjs from "bcryptjs";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Configuración del usuario de prueba
const TEST_USER = {
  email: "prueba@test.com",
  password: "Contraseña123!",
  firstName: "Usuario",
  lastName: "Prueba",
  companyName: "Empresa de Prueba",
};

/**
 * Script simplificado para crear un usuario de prueba directamente en la base de datos
 * usando consultas SQL con Docker para acceder a PostgreSQL
 */
async function createTestUser() {
  try {
    console.log("=== Creación de Usuario de Prueba ===");
    console.log(`Email: ${TEST_USER.email}`);
    console.log(`Contraseña: ${TEST_USER.password}`);

    // Generar hash de contraseña en formato bcrypt (sin prefijo)
    const salt = await bcryptjs.genSalt(12);
    const passwordHash = await bcryptjs.hash(TEST_USER.password, salt);
    console.log(`Hash generado: ${passwordHash}`);

    // Crear archivo SQL temporal
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    const sqlFilePath = path.join(tmpDir, "create-user.sql");

    // SQL para eliminar el usuario si ya existe y crear uno nuevo
    const sql = `
    -- Verificar si el usuario ya existe
    DO $$
    DECLARE
        user_exists BOOLEAN;
        user_id UUID;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM users WHERE email = '${TEST_USER.email}'
        ) INTO user_exists;

        IF user_exists THEN
            -- El usuario ya existe, guardar ID
            SELECT id FROM users WHERE email = '${TEST_USER.email}' INTO user_id;
            
            -- Actualizar contraseña y otros campos
            UPDATE users 
            SET "passwordHash" = '${passwordHash}',
                "firstName" = '${TEST_USER.firstName}',
                "lastName" = '${TEST_USER.lastName}',
                "companyName" = '${TEST_USER.companyName}',
                status = 'active'
            WHERE id = user_id;
            
            RAISE NOTICE 'Usuario % actualizado con nueva contraseña', '${TEST_USER.email}';
        ELSE
            -- Crear nuevo usuario
            INSERT INTO users (
                email, "passwordHash", "firstName", "lastName", 
                "companyName", "isAdmin", status
            ) VALUES (
                '${TEST_USER.email}', '${passwordHash}', '${TEST_USER.firstName}', 
                '${TEST_USER.lastName}', '${TEST_USER.companyName}', FALSE, 'active'
            );
            
            RAISE NOTICE 'Nuevo usuario % creado correctamente', '${TEST_USER.email}';
        END IF;
    END $$;
    
    -- Mostrar resultado
    SELECT id, email, "firstName", "lastName", "companyName", substring("passwordHash" for 10) || '...' AS "passwordHashPrefix"
    FROM users WHERE email = '${TEST_USER.email}';
    `;

    fs.writeFileSync(sqlFilePath, sql);
    console.log("Archivo SQL creado en:", sqlFilePath);

    // Ejecutar SQL con Docker
    console.log("\nEjecutando SQL usando Docker...");
    try {
      // Copiar archivo SQL al contenedor
      execSync(`docker cp ${sqlFilePath} cosmo-postgres:/tmp/create-user.sql`, {
        stdio: "inherit",
      });

      // Ejecutar SQL dentro del contenedor
      execSync(
        `docker exec cosmo-postgres psql -U postgres -d cosmo -f /tmp/create-user.sql`,
        { stdio: "inherit" }
      );

      console.log("\n✅ Usuario creado/actualizado correctamente");
    } catch (error) {
      console.error(
        "Error al ejecutar SQL:",
        error instanceof Error ? error.message : String(error)
      );
      throw new Error(
        "No se pudo ejecutar el SQL. Verifica que el contenedor Docker de PostgreSQL esté en ejecución."
      );
    }

    // Mostrar credenciales para iniciar sesión
    console.log("\n=== ¡USUARIO LISTO PARA INICIAR SESIÓN! ===");
    console.log(`Email: ${TEST_USER.email}`);
    console.log(`Contraseña: ${TEST_USER.password}`);

    // Limpiar archivos temporales
    fs.unlinkSync(sqlFilePath);
    console.log("\nArchivo SQL temporal eliminado.");
  } catch (error) {
    console.error(
      "\n❌ ERROR:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Ejecutar script
createTestUser()
  .then(() => console.log("\nScript completado."))
  .catch((err) =>
    console.error(
      "Error fatal:",
      err instanceof Error ? err.message : String(err)
    )
  );
