#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

/**
 * Carga variables de entorno con prioridad jerárquica para monorepos
 */
class MonorepoEnvLoader {
  constructor() {
    this.loadedFiles = [];
    this.env = process.env.NODE_ENV || "development";
  }

  /**
   * Carga variables con la siguiente prioridad:
   * 1. Variables específicas del workspace (apps/web/.env.local)
   * 2. Variables específicas del ambiente (apps/web/.env.production)
   * 3. Variables globales del ambiente (.env.production)
   * 4. Variables globales por defecto (.env)
   */
  loadEnvironment(workspacePath = process.cwd()) {
    const environments =
      this.env === "development" ? ["local", "development"] : [this.env];

    // 1. Cargar variables globales por defecto
    this.loadEnvFile(path.join(workspacePath, ".env"));

    // 2. Cargar variables globales del ambiente
    for (const env of environments) {
      this.loadEnvFile(path.join(workspacePath, `.env.${env}`));
    }

    // 3. Determinar si estamos en un workspace específico
    const workspaceDir = this.findWorkspaceDir(workspacePath);
    if (workspaceDir) {
      // 4. Cargar variables específicas del workspace
      for (const env of environments) {
        this.loadEnvFile(path.join(workspaceDir, `.env.${env}`));
      }
    }

    this.validateCriticalVars();
    return this.loadedFiles;
  }

  loadEnvFile(filePath) {
    if (fs.existsSync(filePath)) {
      console.log(`📁 Cargando: ${path.relative(process.cwd(), filePath)}`);
      dotenv.config({ path: filePath });
      this.loadedFiles.push(filePath);
    }
  }

  findWorkspaceDir(currentPath) {
    // Buscar si estamos en apps/web o apps/api
    const appsPath = path.join(currentPath, "apps");
    if (fs.existsSync(appsPath)) {
      return null; // Estamos en la raíz
    }

    // Verificar si estamos en un workspace específico
    const parentPath = path.dirname(currentPath);
    if (path.basename(parentPath) === "apps") {
      return currentPath; // Estamos en apps/web o apps/api
    }

    return null;
  }

  validateCriticalVars() {
    const webRequiredVars = ["NEXTAUTH_SECRET", "NEXTAUTH_URL"];

    const apiRequiredVars = ["DATABASE_URL", "JWT_SECRET"];

    const quickbooksVars = [
      "QUICKBOOKS_CLIENT_ID",
      "QUICKBOOKS_CLIENT_SECRET",
      "QUICKBOOKS_REDIRECT_URI",
    ];

    // Determinar qué variables son críticas según el contexto
    let requiredVars = [];

    if (process.cwd().includes("apps/web")) {
      requiredVars = [...webRequiredVars, ...quickbooksVars];
    } else if (process.cwd().includes("apps/api")) {
      requiredVars = apiRequiredVars;
    }

    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      console.error(`❌ Variables de entorno faltantes: ${missing.join(", ")}`);
      console.error(
        `💡 Asegúrate de configurar estas variables en el archivo .env apropiado`
      );

      if (this.env !== "development") {
        process.exit(1);
      }
    }

    console.log(`✅ Variables de entorno validadas para: ${this.env}`);
  }
}

// Función para usar en package.json scripts
const loadEnv = () => {
  const loader = new MonorepoEnvLoader();
  return loader.loadEnvironment();
};

module.exports = { MonorepoEnvLoader, loadEnv };

// Si se ejecuta directamente
if (require.main === module) {
  loadEnv();
}
