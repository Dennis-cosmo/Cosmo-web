import { dataSource } from "..";

async function runMigrations() {
  try {
    // Inicializar la conexión a la base de datos
    await dataSource.initialize();
    console.log("Conexión a la base de datos inicializada correctamente.");

    // Ejecutar las migraciones pendientes
    const migrations = await dataSource.runMigrations();

    if (migrations.length > 0) {
      console.log(`Se ejecutaron ${migrations.length} migraciones:`);
      migrations.forEach((migration) => {
        console.log(`- ${migration.name}`);
      });
    } else {
      console.log("No hay migraciones pendientes.");
    }

    // Cerrar la conexión
    await dataSource.destroy();
    console.log("Conexión a la base de datos cerrada correctamente.");

    process.exit(0);
  } catch (error) {
    console.error("Error al ejecutar las migraciones:", error);
    process.exit(1);
  }
}

runMigrations();
