#!/bin/bash

# Script para ejecutar en producción con Docker

echo "🐳 Iniciando Cosmo en modo PRODUCCIÓN con Docker..."

# Cargar variables de producción
export $(cat .env.docker.prod | grep -v '^#' | xargs)

# Verificar que las variables críticas estén presentes
if [ -z "$QUICKBOOKS_CLIENT_ID" ]; then
    echo "❌ QUICKBOOKS_CLIENT_ID no está configurado en .env.docker.prod"
    exit 1
fi

if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "❌ DEEPSEEK_API_KEY no está configurado en .env.docker.prod"
    exit 1
fi

if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "tu_password_postgres_super_seguro_y_largo_aqui" ]; then
    echo "❌ POSTGRES_PASSWORD debe ser configurado con un valor seguro"
    exit 1
fi

echo "✅ Variables de producción cargadas"
echo "🏗️  Ambiente: $NODE_ENV"
echo "🔑 QuickBooks: $QUICKBOOKS_ENVIRONMENT"
echo "🌐 Domain: $DOMAIN"

# Construir e iniciar los contenedores en producción
docker-compose --env-file .env.docker.prod -f docker-compose.yml -f docker-compose.production.yml up --build -d

echo "🚀 Cosmo ejecutándose en producción:"
echo "   Frontend: https://$DOMAIN"
echo "   API: https://$DOMAIN/api"
echo "   QuickBooks: https://$DOMAIN/integrations/quickbooks"

# Mostrar logs
docker-compose --env-file .env.docker.prod -f docker-compose.yml -f docker-compose.production.yml logs -f 