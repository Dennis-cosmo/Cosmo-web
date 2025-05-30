#!/bin/bash

# =========================================
# COSMO - Free Deployment Script (Vercel Stack)
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

print_status "🚀 Desplegando Cosmo en stack gratuito..."
print_status "📦 Stack: Vercel + Supabase + Upstash"

# Check if required tools are installed
command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed."; exit 1; }

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    print_status "📥 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Create environment file for free deployment
print_status "📝 Configurando variables de entorno para despliegue gratuito..."

cat > .env.free.sample << 'EOF'
# ========================================
# COSMO - FREE DEPLOYMENT ENVIRONMENT
# ========================================

# Environment
NODE_ENV=production

# Domain (will be provided by Vercel)
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
NEXTAUTH_URL=https://tu-app.vercel.app

# Supabase Configuration
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.tu-proyecto.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_KEY=tu_supabase_service_key

# Upstash Redis Configuration
REDIS_URL=rediss://default:tu_password@region.upstash.io:6380

# JWT & Authentication
JWT_SECRET=tu_jwt_secret_muy_largo_minimo_64_caracteres
NEXTAUTH_SECRET=tu_nextauth_secret_diferente_tambien_largo

# AI Configuration
DEEPSEEK_API_KEY=tu_deepseek_api_key
OPENAI_API_KEY=tu_openai_api_key

# Rate Limiting (reduced for free tier)
THROTTLE_TTL=60
THROTTLE_LIMIT=50

# ERP Integration
QB_CLIENT_ID=tu_quickbooks_client_id
QB_CLIENT_SECRET=tu_quickbooks_client_secret
QB_REDIRECT_URI=https://tu-app.vercel.app/api/auth/quickbooks/callback
QB_ENVIRONMENT=sandbox
EOF

if [ ! -f ".env.free" ]; then
    print_warning "⚠️  Archivo .env.free no encontrado. Copiando ejemplo..."
    cp .env.free.sample .env.free
    print_warning "⚠️  IMPORTANTE: Edita .env.free con tus valores reales antes de continuar"
    print_warning "⚠️  Especialmente:"
    print_warning "    1. URLs de Supabase"
    print_warning "    2. URL de Upstash Redis"
    print_warning "    3. JWT secrets"
    print_warning "    4. API keys"
    echo ""
    read -p "Presiona Enter cuando hayas configurado .env.free..."
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto cosmo-app"
    exit 1
fi

# Deploy Frontend (Next.js) to Vercel
print_status "🌐 Desplegando Frontend en Vercel..."
cd apps/web

# Configure Vercel project
print_status "🔧 Configurando proyecto en Vercel..."

# Create vercel.json configuration
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "cosmo-web",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://cosmo-api.vercel.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

# Deploy frontend
print_status "🚀 Desplegando frontend..."
vercel --prod --yes

print_success "✅ Frontend desplegado exitosamente"

# Go back to root
cd ../..

# Deploy Backend API to Vercel
print_status "🔧 Desplegando Backend API en Vercel..."
cd apps/api

# Create API vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "cosmo-api",
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/main.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/src/main.ts"
    }
  ]
}
EOF

# Deploy API
print_status "🚀 Desplegando API..."
vercel --prod --yes

print_success "✅ API desplegada exitosamente"

cd ../..

# Instructions for next steps
print_success "🎉 ¡Despliegue inicial completado!"
print_status ""
print_status "📋 Próximos pasos:"
print_status "1. Configura tu base de datos en Supabase:"
print_status "   - Ve a https://supabase.com"
print_status "   - Crea un nuevo proyecto"
print_status "   - Ejecuta las migraciones de la BD"
print_status "   - Copia la URL y las keys a .env.free"
print_status ""
print_status "2. Configura Redis en Upstash:"
print_status "   - Ve a https://upstash.com"
print_status "   - Crea una nueva base de datos Redis"
print_status "   - Copia la URL de conexión a .env.free"
print_status ""
print_status "3. Configura variables de entorno en Vercel:"
print_status "   - Ve a tu dashboard de Vercel"
print_status "   - Project Settings → Environment Variables"
print_status "   - Agrega todas las variables de .env.free"
print_status ""
print_status "4. Configura tu dominio personalizado:"
print_status "   - En Vercel: Project Settings → Domains"
print_status "   - Agrega tu dominio: tu-dominio.com"
print_status "   - Configura DNS según las instrucciones"
print_status ""
print_warning "⚠️  Recuerda actualizar las URLs en .env.free después de cada paso"
print_status ""
print_status "🔧 Comandos útiles:"
print_status "- Redesplegar frontend: cd apps/web && vercel --prod"
print_status "- Redesplegar API: cd apps/api && vercel --prod"
print_status "- Ver logs: vercel logs [deployment-url]"
print_status ""
print_success "🆓 ¡Tu aplicación está corriendo gratis en Vercel!" 