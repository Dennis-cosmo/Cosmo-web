#!/bin/bash

# Script para ejecutar en desarrollo con Docker

echo "🐳 Iniciando Cosmo en modo DESARROLLO con Docker..."

# Cargar variables de desarrollo
export $(cat .env.docker.dev | grep -v '^#' | xargs)

# Verificar que las variables críticas estén presentes
if [ -z "$QUICKBOOKS_CLIENT_ID" ]; then
    echo "❌ QUICKBOOKS_CLIENT_ID no está configurado en .env.docker.dev"
    exit 1
fi

if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "⚠️  DEEPSEEK_API_KEY no está configurado en .env.docker.dev"
fi

echo "✅ Variables de desarrollo cargadas"
echo "🏗️  Ambiente: $NODE_ENV"
echo "🔑 QuickBooks: $QUICKBOOKS_ENVIRONMENT"
echo "🌐 Frontend: $FRONTEND_URL"
echo "🔌 API: $NEXT_PUBLIC_API_URL"

# Construir e iniciar los contenedores
docker-compose --env-file .env.docker.dev up --build

echo "🚀 Cosmo ejecutándose en:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:4000"
echo "   QuickBooks Test: http://localhost:3000/integrations/quickbooks" 