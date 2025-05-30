#!/bin/bash

# =========================================
# COSMO - Production Deployment Script
# =========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
PROJECT_NAME="cosmo"

print_status "🚀 Starting Cosmo production deployment..."

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file $ENV_FILE not found!"
    print_status "Please copy env.production.sample to .env.production and configure it"
    exit 1
fi

# Create necessary directories
mkdir -p ./docker/ssl
mkdir -p ./docker/postgres-backup
mkdir -p $BACKUP_DIR

# Check if SSL certificates exist
if [ ! -f "./docker/ssl/cert.pem" ] || [ ! -f "./docker/ssl/key.pem" ]; then
    print_warning "SSL certificates not found in ./docker/ssl/"
    print_status "You can use Let's Encrypt or place your certificates manually"
    print_status "For now, creating self-signed certificates for testing..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./docker/ssl/key.pem \
        -out ./docker/ssl/cert.pem \
        -subj "/C=ES/ST=Madrid/L=Madrid/O=Cosmo/OU=IT/CN=localhost"
    
    print_warning "⚠️  Using self-signed certificates. Replace with valid SSL certificates for production!"
fi

# Load environment variables
export $(cat $ENV_FILE | grep -v ^# | xargs)

# Backup database if it exists
if docker ps | grep -q "cosmo-postgres-prod"; then
    print_status "📦 Creating database backup..."
    docker exec cosmo-postgres-prod pg_dump -U $POSTGRES_USER $POSTGRES_DB > "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    print_success "Database backup created"
fi

# Pull latest changes
print_status "📥 Pulling latest code changes..."
git pull origin main

# Build and deploy
print_status "🔨 Building and starting containers..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE build --no-cache
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d

# Wait for services to be ready
print_status "⏳ Waiting for services to be ready..."
sleep 30

# Check if all services are running
SERVICES=("cosmo-nginx-prod" "cosmo-web-prod" "cosmo-api-prod" "cosmo-postgres-prod" "cosmo-redis-prod")

for service in "${SERVICES[@]}"; do
    if docker ps | grep -q "$service"; then
        print_success "✅ $service is running"
    else
        print_error "❌ $service is not running"
        docker logs $service --tail 50
    fi
done

# Run database migrations
print_status "🗄️ Running database migrations..."
docker exec cosmo-api-prod npm run migration:run

# Health check
print_status "🔍 Performing health check..."
sleep 10

# Check nginx
if curl -f -s https://localhost/health > /dev/null; then
    print_success "✅ Nginx health check passed"
else
    print_warning "⚠️ Nginx health check failed"
fi

# Check API
if curl -f -s https://localhost/api/health > /dev/null; then
    print_success "✅ API health check passed"
else
    print_warning "⚠️ API health check failed"
    docker logs cosmo-api-prod --tail 20
fi

# Clean up old images
print_status "🧹 Cleaning up old Docker images..."
docker image prune -f

print_success "🎉 Deployment completed!"
print_status "📋 Deployment Summary:"
echo "  - Environment: Production"
echo "  - Services: $(docker ps --filter 'name=cosmo' --format 'table {{.Names}}' | tail -n +2 | wc -l) running"
echo "  - URL: https://$DOMAIN"
echo "  - API: https://$DOMAIN/api"
echo ""
print_status "📊 Useful commands:"
echo "  - Check logs: docker-compose -f $COMPOSE_FILE logs -f [service_name]"
echo "  - View status: docker-compose -f $COMPOSE_FILE ps"
echo "  - Stop all: docker-compose -f $COMPOSE_FILE down"
echo "  - Restart service: docker-compose -f $COMPOSE_FILE restart [service_name]"
echo ""
print_warning "⚠️ Don't forget to:"
echo "  1. Configure your domain DNS to point to this server"
echo "  2. Set up proper SSL certificates (Let's Encrypt recommended)"
echo "  3. Configure monitoring and alerts"
echo "  4. Set up automated backups" 