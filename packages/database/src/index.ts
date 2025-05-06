import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";

// Entidades
export * from "./entities";

// Configuración de conexión a base de datos
export const getDataSource = () => {
  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [path.join(__dirname, "entities/**/*.entity{.ts,.js}")],
    migrations: [path.join(__dirname, "migrations/**/*{.ts,.js}")],
    logging: process.env.NODE_ENV === "development",
  });

  return dataSource;
};

// Datasource para migraciones
export const dataSource = getDataSource();
