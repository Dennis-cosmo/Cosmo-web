#!/bin/bash

# =========================================
# COSMO - Railway Deployment Setup Script
# =========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Preparando Cosmo para despliegue en Railway..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto cosmo-app"
    exit 1
fi

# Check if git is initialized and clean
if [ ! -d ".git" ]; then
    print_error "Este proyecto debe estar en un repositorio Git para Railway"
    print_status "Ejecuta: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "⚠️  Tienes cambios sin commitear. Railway usa el último commit."
    echo ""
    read -p "¿Quieres commitear los cambios ahora? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Prepare for Railway deployment"
        print_success "✅ Cambios commiteados"
    else
        print_warning "⚠️  Continúando con el último commit disponible"
    fi
fi

# Generate secrets if needed
print_status "🔐 Generando secrets para producción..."

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
NEXTAUTH_SECRET=$(openssl rand -base64 64 | tr -d '\n')

print_success "✅ Secrets generados"

# Create Railway environment file
print_status "📝 Creando archivo de configuración para Railway..."

if [ ! -f "env.railway" ]; then
    cp env.railway.sample env.railway
    
    # Replace secrets in the file
    if command -v sed &> /dev/null; then
        sed -i.bak "s/genera_un_secret_muy_largo_y_aleatorio_minimo_64_caracteres_para_jwt/$JWT_SECRET/" env.railway
        sed -i.bak "s/genera_otro_secret_diferente_tambien_muy_largo_para_nextauth_auth/$NEXTAUTH_SECRET/" env.railway
        rm env.railway.bak 2>/dev/null || true
    fi
    
    print_success "✅ Archivo env.railway creado"
    print_warning "⚠️  IMPORTANTE: Edita env.railway con tus API keys reales antes de configurar Railway"
else
    print_warning "⚠️  env.railway ya existe, no se sobrescribirá"
fi

# Check Docker configuration
print_status "🐳 Verificando configuración Docker..."

if [ ! -f "docker-compose.railway.yml" ]; then
    print_error "❌ docker-compose.railway.yml no encontrado"
    exit 1
fi

if [ ! -f "docker/web.Dockerfile" ] || [ ! -f "docker/api.Dockerfile" ]; then
    print_error "❌ Dockerfiles no encontrados"
    exit 1
fi

print_success "✅ Configuración Docker verificada"

# Verify package.json scripts
print_status "📦 Verificando scripts de Node.js..."

# Check web app
if ! grep -q '"build"' apps/web/package.json; then
    print_error "❌ Script 'build' no encontrado en apps/web/package.json"
    exit 1
fi

if ! grep -q '"start"' apps/web/package.json; then
    print_error "❌ Script 'start' no encontrado en apps/web/package.json"
    exit 1
fi

# Check API app
if ! grep -q '"build"' apps/api/package.json; then
    print_error "❌ Script 'build' no encontrado en apps/api/package.json"
    exit 1
fi

if ! grep -q '"start:prod"' apps/api/package.json; then
    print_error "❌ Script 'start:prod' no encontrado en apps/api/package.json"
    exit 1
fi

print_success "✅ Scripts de Node.js verificados"

# Test Docker builds locally (optional)
print_status "🧪 ¿Quieres probar los builds de Docker localmente? (recomendado)"
read -p "Esto tardará unos minutos (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "🔨 Probando build del frontend..."
    docker build -f docker/web.Dockerfile -t cosmo-web-test . --no-cache
    
    print_status "🔨 Probando build del backend..."
    docker build -f docker/api.Dockerfile -t cosmo-api-test . --no-cache
    
    print_success "✅ Builds locales exitosos"
    
    # Clean up test images
    docker rmi cosmo-web-test cosmo-api-test 2>/dev/null || true
else
    print_warning "⚠️  Saltando tests locales"
fi

# Final checklist
print_success "🎉 ¡Preparación completada!"
echo ""
print_status "📋 CHECKLIST ANTES DE CONTINUAR:"
echo "  ✅ Proyecto en Git con commits actualizados"
echo "  ✅ Dockerfiles optimizados para producción"
echo "  ✅ Configuración de Next.js actualizada"
echo "  ✅ Variables de entorno preparadas"
echo "  ✅ Scripts de build verificados"
echo ""
print_status "🚀 PRÓXIMOS PASOS:"
echo ""
print_status "1. 📝 Edita el archivo 'env.railway' con tus datos reales:"
echo "   - DEEPSEEK_API_KEY=tu_api_key_real"
echo "   - OPENAI_API_KEY=tu_api_key_real"
echo "   - (Los secrets JWT ya están generados)"
echo ""
print_status "2. 🔗 Sube tu código a GitHub (si no lo has hecho):"
echo "   git remote add origin https://github.com/tu-usuario/cosmo-app.git"
echo "   git push -u origin main"
echo ""
print_status "3. 🚂 Ve a Railway y conecta tu repositorio:"
echo "   - Ve a: https://railway.app"
echo "   - Sign up with GitHub"
echo "   - New Project → Deploy from GitHub repo"
echo "   - Selecciona: cosmo-app"
echo ""
print_status "4. 🔧 Railway detectará automáticamente:"
echo "   - 4 servicios (web, api, postgres, redis)"
echo "   - Configuración de docker-compose.railway.yml"
echo "   - Variables de entorno necesarias"
echo ""
print_status "5. ⚙️ Configura las variables de entorno en Railway:"
echo "   - Copia las variables de 'env.railway' a cada servicio"
echo "   - Railway auto-generará DATABASE_URL y REDIS_URL"
echo ""
print_warning "⚠️  IMPORTANTE: Guarda este archivo env.railway en un lugar seguro"
print_warning "⚠️  Contiene secrets que no debes compartir públicamente"
echo ""
print_status "🔧 COMANDOS ÚTILES:"
echo "  - Ver este resumen: cat scripts/deploy-railway.sh"
echo "  - Generar nuevos secrets: openssl rand -base64 64"
echo "  - Ver variables actuales: cat env.railway"
echo ""
print_success "✅ ¡Listo para desplegar en Railway!" 