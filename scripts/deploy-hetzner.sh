#!/bin/bash

# ========================================
# COSMO - DEPLOYMENT SCRIPT FOR HETZNER
# ========================================

set -e

echo "🇩🇪 Iniciando deployment en Hetzner Cloud (GDPR Compliant)..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones helper
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

# Variables
SERVER_IP=""
DOMAIN=""
SSH_KEY_PATH="$HOME/.ssh/id_rsa"

# Función para validar variables de entorno
validate_env() {
    print_status "Validando variables de entorno..."
    
    if [ ! -f "env.hetzner.production" ]; then
        print_error "Archivo env.hetzner.production no encontrado"
        print_warning "Ejecuta: cp env.hetzner.production.sample env.hetzner.production"
        print_warning "Y configura tus variables reales"
        exit 1
    fi
    
    # Cargar variables de forma segura
    print_status "Cargando variables desde env.hetzner.production..."
    if [ -f "env.hetzner.production" ]; then
      # Limpiar el entorno de variables que podrían tener el mismo nombre que archivos
      # Esto es una medida de precaución extra, aunque el bucle de abajo debería ser seguro.
      unset $(env | grep -E '(DEPL|CONF|HETZ|IMPL|READ|SETU|dock|env|next|pack|tsco|turb|verc|yarn)' | cut -d= -f1 || true)

      # Leer el archivo línea por línea y exportar las variables
      while IFS= read -r line || [ -n "$line" ]; do
        # Saltar líneas vacías o comentarios
        if [[ "$line" =~ ^\s*# || -z "$line" ]]; then
          continue
        fi
        # Eliminar comentarios al final de la línea y espacios en blanco al final
        cleaned_line=$(echo "$line" | sed -e 's/[[:space:]]*#.*//' -e 's/[[:space:]]*$//')
        # Asegurarse de que la línea tenga el formato KEY=VALUE
        if [[ "$cleaned_line" == *"="* ]]; then
          export "$cleaned_line"
        else
          print_warning "Línea ignorada en env.hetzner.production (formato incorrecto): $cleaned_line"
        fi
      done < "env.hetzner.production"
      print_success "Variables procesadas desde env.hetzner.production"
    else
      print_error "Archivo env.hetzner.production no encontrado para exportar variables."
      exit 1
    fi
    
    # Verificar variables críticas
    if [[ -z "$POSTGRES_PASSWORD" || "$POSTGRES_PASSWORD" == "CAMBIAR_POR_PASSWORD_SUPER_SEGURO_AQUI" ]]; then
        print_error "Debes cambiar POSTGRES_PASSWORD en env.hetzner.production"
        exit 1
    fi
    
    if [[ -z "$JWT_SECRET" || "$JWT_SECRET" == "GENERAR_CON_openssl_rand_base64_64" ]]; then
        print_error "Debes generar JWT_SECRET en env.hetzner.production"
        print_warning "Ejecuta: openssl rand -base64 64"
        exit 1
    fi
    
    if [[ -z "$DOMAIN" || "$DOMAIN" == "tudominio.com" ]]; then
        print_error "Debes configurar tu dominio real en env.hetzner.production"
        exit 1
    fi
    
    print_success "Variables de entorno validadas"
}

# Función para leer configuración del usuario
read_config() {
    print_status "Configuración del servidor..."
    
    read -p "IP del servidor Hetzner: " SERVER_IP
    if [[ -z "$SERVER_IP" ]]; then
        print_error "IP del servidor es requerida"
        exit 1
    fi
    
    read -p "Dominio (ejemplo: miapp.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        print_error "Dominio es requerido"
        exit 1
    fi
    
    read -p "Ruta a tu SSH key [$SSH_KEY_PATH]: " input_key_path
    SSH_KEY_PATH=${input_key_path:-$SSH_KEY_PATH}
    
    if [[ ! -f "$SSH_KEY_PATH" ]]; then
        print_error "SSH key no encontrada en $SSH_KEY_PATH"
        exit 1
    fi
    
    print_success "Configuración completada"
    print_status "Servidor: $SERVER_IP"
    print_status "Dominio: $DOMAIN"
}

# Función para preparar el servidor
prepare_server() {
    print_status "Preparando servidor Hetzner..."
    
    # Actualizar sistema y instalar dependencias
    ssh -i "$SSH_KEY_PATH" root@"$SERVER_IP" << 'EOF'
        set -e
        
        # Update system
        apt-get update && apt-get upgrade -y
        
        # Install Docker
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        
        # Install/Update Docker Compose
        DOCKER_COMPOSE_VERSION="v2.27.0" # Or a newer stable version
        echo "[INFO] Checking/Installing Docker Compose version $DOCKER_COMPOSE_VERSION..."
        
        echo "[INFO] Attempting to unlock /usr/local/bin/docker-compose if busy..."
        sudo fuser -k /usr/local/bin/docker-compose || true # Intenta terminar procesos usando el archivo
        sudo pkill -f docker-compose || true # Intenta terminar procesos con 'docker-compose' en su nombre
        sudo rm -f /usr/local/bin/docker-compose # Elimina forzosamente el archivo
        sleep 1 # Pequeña pausa
        
        # Con 'EOF', $DOCKER_COMPOSE_VERSION y $(uname) se expanden en el servidor.
        sudo curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        # Verify installation
        echo "[INFO] Verifying Docker Compose installation..."
        /usr/local/bin/docker-compose version
        
        # Install other tools
        apt-get install -y git nginx certbot python3-certbot-nginx htop unzip
        
        # Create app directory
        mkdir -p /app
        mkdir -p /app/docker/ssl
        mkdir -p /app/docker/postgres-backup
        mkdir -p /app/logs
        
        # Configure firewall
        ufw allow ssh
        ufw allow 80
        ufw allow 443
        ufw --force enable
        
        echo "✅ Servidor preparado"
EOF
    
    print_success "Servidor preparado correctamente"
}

# Función para configurar SSL
setup_ssl() {
    print_status "Configurando certificados SSL con Let's Encrypt..."
    
    ssh -i "$SSH_KEY_PATH" root@"$SERVER_IP" << EOF
        set -e
        
        # Detener nginx si está corriendo
        systemctl stop nginx || true
        
        # Obtener certificados SSL
        certbot certonly --standalone \
            --email admin@${DOMAIN} \
            --agree-tos \
            --no-eff-email \
            --keep-until-expiring \
            -d ${DOMAIN} \
            -d www.${DOMAIN}
        
        # Copiar certificados a directorio Docker
        cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /app/docker/ssl/cert.pem
        cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem /app/docker/ssl/key.pem
        
        # Configurar renovación automática
        echo "0 12 * * * /usr/bin/certbot renew --quiet && cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /app/docker/ssl/cert.pem && cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem /app/docker/ssl/key.pem && docker-compose -f /app/docker-compose.hetzner.yml restart nginx" | crontab -
        
        echo "✅ SSL configurado"
EOF
    
    print_success "SSL configurado correctamente"
}

# Función para subir código
upload_code() {
    print_status "Subiendo código y configuración al servidor..."
    
    # Crear archivo tar excluyendo archivos innecesarios
    tar --exclude='node_modules' \
        --exclude='.git' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='*.log' \
        --exclude='.env*' \
        -czf cosmo-app.tar.gz .
    
    # Subir archivo tar
    scp -i "$SSH_KEY_PATH" cosmo-app.tar.gz root@"$SERVER_IP":/app/
    
    # Subir archivo de variables de entorno
    scp -i "$SSH_KEY_PATH" env.hetzner.production root@"$SERVER_IP":/app/.env
    
    # Subir archivo docker-compose de Hetzner
    scp -i "$SSH_KEY_PATH" docker-compose.hetzner.yml root@"$SERVER_IP":/app/docker-compose.hetzner.yml
    
    # Extraer en el servidor
    ssh -i "$SSH_KEY_PATH" root@"$SERVER_IP" << EOF
        cd /app
        echo "[DEBUG] Contenido de /app ANTES de extraer el tar:"
        ls -la
        echo "[DEBUG] Extrayendo cosmo-app.tar.gz..."
        tar -xzf cosmo-app.tar.gz
        rm cosmo-app.tar.gz
        
        echo "[DEBUG] Contenido de /app DESPUÉS de extraer el tar:"
        ls -la
        echo "[DEBUG] Verificando existencia de apps/web/package.json..."
        if [ -f "apps/web/package.json" ]; then
            echo "[DEBUG] SUCCESS: apps/web/package.json ENCONTRADO en /app/apps/web/package.json"
        else
            echo "[DEBUG] ERROR: apps/web/package.json NO ENCONTRADO en /app/apps/web/package.json"
        fi
        echo "[DEBUG] Contenido de /app/apps (si existe):"
        ls -la apps || echo "[DEBUG] Directorio /app/apps no existe"
        echo "[DEBUG] Contenido de /app/apps/web (si existe):"
        ls -la apps/web || echo "[DEBUG] Directorio /app/apps/web no existe"

        # Actualizar configuración con dominio real en Nginx
        # Asegúrate que nginx.hetzner.conf está en la ubicación correcta después de extraer
        if [ -f "docker/nginx.hetzner.conf" ]; then
            sed -i "s/tudominio\.com/${DOMAIN}/g" docker/nginx.hetzner.conf
        else
            echo "[WARNING] No se encontró docker/nginx.hetzner.conf para actualizar el dominio."
        fi
        
        echo "✅ Código y configuración subidos"
EOF
    
    # Limpiar archivo local
    rm -f cosmo-app.tar.gz # Asegurar que se elimina el tar local
    
    print_success "Código y configuración subidos correctamente"
}

# Función para ejecutar Docker
deploy_docker() {
    print_status "Desplegando aplicación con Docker..."
    
    ssh -i "$SSH_KEY_PATH" root@"$SERVER_IP" << EOF
        set -e # Asegurar que el script SSH falle si un comando falla
        cd /app
        
        echo "[INFO] Forzando reconstrucción de imágenes Docker sin caché..."
        docker-compose -f docker-compose.hetzner.yml --env-file .env build --no-cache
        
        echo "[INFO] Levantando contenedores (forzando recreación) en modo foreground para diagnóstico..."
        # Quitamos -d para ver los logs en tiempo real. El script se detendrá aquí hasta que presiones Ctrl+C.
        docker-compose -f docker-compose.hetzner.yml --env-file .env up --force-recreate
        
        # Las siguientes líneas no se alcanzarán automáticamente si 'up' está en foreground.
        # echo "[INFO] Esperando que los servicios estén listos (puede tomar unos minutos)..."
        # sleep 60 
        
        # echo "[INFO] Estado actual de los contenedores:"
        # docker-compose -f docker-compose.hetzner.yml ps
        
        echo "✅ Aplicación (intento de inicio) completado. Revisa los logs." # Mensaje ajustado
EOF
    
    print_success "Aplicación (intento de inicio) completado. Revisa los logs." # Mensaje ajustado
}

# Función para verificar deployment
verify_deployment() {
    print_status "Verificando deployment..."
    
    # Verificar que la aplicación responda
    if curl -f -s "https://$DOMAIN/health" > /dev/null; then
        print_success "✅ Aplicación respondiendo correctamente"
    else
        print_warning "⚠️ Aplicación no responde en https://$DOMAIN/health"
    fi
    
    # Verificar servicios
    ssh -i "$SSH_KEY_PATH" root@"$SERVER_IP" << 'EOF'
        cd /app
        
        echo "=== Estado de contenedores ==="
        docker-compose -f docker-compose.hetzner.yml ps
        
        echo "=== Logs recientes ==="
        docker-compose -f docker-compose.hetzner.yml logs --tail=20
EOF
}

# Función para configurar monitoreo
setup_monitoring() {
    print_status "Configurando monitoreo básico..."
    
    ssh -i "$SSH_KEY_PATH" root@"$SERVER_IP" << 'EOF'
        # Script de monitoreo
        cat > /usr/local/bin/cosmo-monitor.sh << 'MONITOR_EOF'
#!/bin/bash
cd /app

# Verificar contenedores
if ! docker-compose -f docker-compose.hetzner.yml ps | grep -q "Up"; then
    echo "$(date): ⚠️ Algunos contenedores no están funcionando" >> /var/log/cosmo-monitor.log
    docker-compose -f docker-compose.hetzner.yml up -d
fi

# Verificar espacio en disco
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 80 ]; then
    echo "$(date): ⚠️ Espacio en disco: ${disk_usage}%" >> /var/log/cosmo-monitor.log
fi

# Limpiar logs antiguos (GDPR compliance)
find /app/logs -name "*.log" -mtime +90 -delete
docker system prune -f > /dev/null 2>&1
MONITOR_EOF

        chmod +x /usr/local/bin/cosmo-monitor.sh
        
        # Configurar cron para monitoreo
        echo "*/5 * * * * /usr/local/bin/cosmo-monitor.sh" | crontab -
        
        echo "✅ Monitoreo configurado"
EOF
    
    print_success "Monitoreo configurado"
}

# Función principal
main() {
    echo "=========================================="
    echo "🇩🇪 COSMO - HETZNER DEPLOYMENT"
    echo "=========================================="
    echo ""
    
    validate_env
    read_config
    
    print_status "¿Continuar con el deployment? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelado"
        exit 0
    fi
    
    prepare_server
    setup_ssl
    upload_code
    deploy_docker
    verify_deployment
    setup_monitoring
    
    echo ""
    echo "=========================================="
    print_success "🎉 DEPLOYMENT COMPLETADO"
    echo "=========================================="
    echo ""
    print_success "🌐 Aplicación disponible en: https://$DOMAIN"
    print_success "🔒 SSL configurado automáticamente"
    print_success "📊 Monitoreo activo"
    print_success "🇪🇺 GDPR Compliant"
    echo ""
    print_status "URLs importantes:"
    echo "  • Frontend: https://$DOMAIN"
    echo "  • API: https://$DOMAIN/api"
    echo "  • QuickBooks: https://$DOMAIN/integrations/quickbooks"
    echo "  • Health Check: https://$DOMAIN/health"
    echo ""
    print_status "Para ver logs:"
    echo "  ssh -i $SSH_KEY_PATH root@$SERVER_IP"
    echo "  cd /app && docker-compose -f docker-compose.hetzner.yml logs -f"
    echo ""
}

# Ejecutar función principal
main "$@" 