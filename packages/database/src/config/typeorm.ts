import { config as dotenvConfig } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import path from "path";

// Load .env file from the root of the 'database' package (e.g., packages/database/.env)
dotenvConfig({ path: path.resolve(__dirname, "../../.env") });

const {
  DATABASE_URL,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

let connectionBaseOptions: Partial<DataSourceOptions>;

if (DATABASE_URL) {
  connectionBaseOptions = {
    url: DATABASE_URL,
  };
} else {
  // Fallback if DATABASE_URL is not set, and individual DB variables are used
  connectionBaseOptions = {
    host: DB_HOST || "localhost",
    port: parseInt(DB_PORT || "5432", 10),
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  };
}

const config = {
  type: "postgres",
  ...connectionBaseOptions,
  entities: [path.join(__dirname, "../entities/**/*.entity.{ts,js}")],
  migrations: [path.join(__dirname, "../migrations/**/*.{ts,js}")],
  synchronize: false, // Should be false for a migration-based workflow
  logging: NODE_ENV === "development" ? ["query", "error"] : ["error"],
  // cli: { // Optional: Explicitly tell TypeORM where to find/create migration files
  //   migrationsDir: 'src/migrations' // This ensures 'migration:create' puts .ts files here
  // }
};

const AppDataSource = new DataSource(config as DataSourceOptions);
export default AppDataSource;
