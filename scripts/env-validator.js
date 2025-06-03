#!/usr/bin/env node

const { MonorepoEnvLoader } = require("./env-loader");

const validateEnvironment = () => {
  console.log("🔍 Validando configuración de variables de entorno...\n");

  const loader = new MonorepoEnvLoader();
  const loadedFiles = loader.loadEnvironment();

  console.log("\n📁 Archivos de variables cargados:");
  loadedFiles.forEach((file) => console.log(`  ✅ ${file}`));

  console.log("\n🔑 Variables críticas encontradas:");

  // Variables de QuickBooks
  const qbVars = {
    QUICKBOOKS_CLIENT_ID: process.env.QUICKBOOKS_CLIENT_ID,
    QUICKBOOKS_CLIENT_SECRET: process.env.QUICKBOOKS_CLIENT_SECRET
      ? "***OCULTO***"
      : undefined,
    QUICKBOOKS_REDIRECT_URI: process.env.QUICKBOOKS_REDIRECT_URI,
    QUICKBOOKS_ENVIRONMENT: process.env.QUICKBOOKS_ENVIRONMENT,
  };

  // Variables de autenticación
  const authVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "***OCULTO***" : undefined,
    JWT_SECRET: process.env.JWT_SECRET ? "***OCULTO***" : undefined,
  };

  // Variables de infraestructura
  const infraVars = {
    DATABASE_URL: process.env.DATABASE_URL ? "***OCULTO***" : undefined,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  };

  console.log("\n📦 QuickBooks:");
  Object.entries(qbVars).forEach(([key, value]) => {
    console.log(`  ${value ? "✅" : "❌"} ${key}: ${value || "NO DEFINIDA"}`);
  });

  console.log("\n🔐 Autenticación:");
  Object.entries(authVars).forEach(([key, value]) => {
    console.log(`  ${value ? "✅" : "❌"} ${key}: ${value || "NO DEFINIDA"}`);
  });

  console.log("\n🏗️ Infraestructura:");
  Object.entries(infraVars).forEach(([key, value]) => {
    console.log(`  ${value ? "✅" : "❌"} ${key}: ${value || "NO DEFINIDA"}`);
  });

  console.log("\n🎯 Ambiente actual:", process.env.NODE_ENV || "development");

  // Verificar diferencias entre ambientes
  if (process.env.QUICKBOOKS_ENVIRONMENT) {
    const isProduction = process.env.NODE_ENV === "production";
    const qbIsProduction = process.env.QUICKBOOKS_ENVIRONMENT === "production";

    if (isProduction && !qbIsProduction) {
      console.log(
        "\n⚠️  ADVERTENCIA: Estás en producción pero QuickBooks está en sandbox"
      );
    } else if (!isProduction && qbIsProduction) {
      console.log(
        "\n⚠️  ADVERTENCIA: Estás en desarrollo pero QuickBooks está en producción"
      );
    }
  }

  console.log("\n✅ Validación completada\n");
};

validateEnvironment();
