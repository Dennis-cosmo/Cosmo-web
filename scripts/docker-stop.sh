#!/bin/bash

# Script para detener todos los contenedores

echo "🛑 Deteniendo todos los contenedores de Cosmo..."

# Detener desarrollo si está corriendo
if [ -f .env.docker.dev ]; then
    echo "🔄 Deteniendo contenedores de desarrollo..."
    docker-compose --env-file .env.docker.dev down
fi

# Detener producción si está corriendo
if [ -f .env.docker.prod ]; then
    echo "🔄 Deteniendo contenedores de producción..."
    docker-compose --env-file .env.docker.prod -f docker-compose.yml -f docker-compose.production.yml down
fi

echo "✅ Todos los contenedores detenidos" 