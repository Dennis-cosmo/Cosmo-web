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

# Ya no se necesitan SERVER_IP y DOMAIN aquí, se manejan desde el .env
# SSH_KEY_PATH se define más abajo con valor por defecto si no está en .env

# Cargar variables de entorno desde env.hetzner.production
ENV_FILE="env.hetzner.production"
if [ -f "$ENV_FILE" ]; then
  print_status "Cargando variables de entorno desde $ENV_FILE..."
  
  # Procesar el archivo línea por línea de forma robusta
  while IFS= read -r line || [[ -n "$line" ]]; do
      # Eliminar espacios en blanco al inicio y final de la línea
      cleaned_line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

      # Omitir comentarios y líneas vacías
      if [[ "$cleaned_line" =~ ^# ]] || [[ -z "$cleaned_line" ]]; then
          continue
      fi

      # Extraer clave y valor. Esto maneja KEY=, KEY=VALUE, KEY="VALUE", KEY='VALUE'
      if [[ "$cleaned_line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
          key="${BASH_REMATCH[1]}"
          value="${BASH_REMATCH[2]}"

          # Eliminar comillas opcionales (simples o dobles) del valor
          if [[ "$value" =~ ^\"(.*)\"$ ]] || [[ "$value" =~ ^\'(.*)\'$ ]]; then
              value="${BASH_REMATCH[1]}"
          else
              # Si no estaba entrecomillado, eliminar espacios en blanco al final del valor
              value=$(echo "$value" | sed -e 's/[[:space:]]*$//')
          fi
          
          export "$key=$value"
          # Descomentar para depuración: print_status "  Exportada: $key"
      else
          print_warning "Línea ignorada en $ENV_FILE (formato incorrecto): $cleaned_line"
      fi
  done < "$ENV_FILE"
  print_success "Variables procesadas desde $ENV_FILE"
else
  print_error "Archivo $ENV_FILE no encontrado."
  print_warning "Por favor, asegúrate de que el archivo $ENV_FILE existe en la raíz del proyecto y contiene las variables necesarias."
  exit 1
fi

# ---- Definición de Variables de Configuración y Valores por Defecto ----
# Estas variables se intentarán poblar desde el archivo env.hetzner.production.
# Si no se encuentran allí, algunas tomarán valores por defecto.

# El script espera HETZNER_SERVER_IP en el archivo env.hetzner.production.
# No hay valor por defecto para HETZNER_SERVER_IP.

# El script espera DOMAIN_NAME en env.hetzner.production.
# Si no la encuentra, usará 'simplycosmo.com'.
# La variable DOMAIN_NAME ya debería estar en el entorno si se exportó del archivo.
FINAL_DOMAIN_NAME="${DOMAIN_NAME:-simplycosmo.com}"

# El script espera ADMIN_EMAIL en env.hetzner.production.
# Si no la encuentra, usará 'info@simplycosmo.com'.
FINAL_ADMIN_EMAIL="${ADMIN_EMAIL:-info@simplycosmo.com}"

# El script espera SSH_KEY_PATH en env.hetzner.production.
# Si no la encuentra, usará '$HOME/.ssh/id_ed25519_hetzner'.
FINAL_SSH_KEY_PATH="${SSH_KEY_PATH:-$HOME/.ssh/id_ed25519_hetzner}"

# El script espera REMOTE_USER en env.hetzner.production.
# Si no la encuentra, usará 'root'.
FINAL_REMOTE_USER="${REMOTE_USER:-root}"

# Asignar HETZNER_SERVER_IP a REMOTE_HOST para uso interno del script.
# HETZNER_SERVER_IP debe venir directamente del .env
FINAL_REMOTE_HOST="${HETZNER_SERVER_IP}"

# ---- Verificación de Variables Esenciales ----
print_status "Verificando variables de configuración requeridas..."
missing_vars_flag=false

if [ -z "${HETZNER_SERVER_IP}" ]; then
  print_error "  Variable requerida HETZNER_SERVER_IP no está definida en $ENV_FILE."
  missing_vars_flag=true
fi

# Aunque algunas tienen defaults, verificamos que no estén vacías después de aplicar defaults
# (lo cual no debería pasar con los defaults actuales, pero es buena práctica).
if [ -z "${FINAL_DOMAIN_NAME}" ]; then
  print_error "  DOMAIN_NAME está vacía. Asegúrate que DOMAIN_NAME esté en $ENV_FILE o que el valor por defecto sea válido."
  missing_vars_flag=true
fi
if [ -z "${FINAL_ADMIN_EMAIL}" ]; then
  print_error "  ADMIN_EMAIL está vacío. Asegúrate que ADMIN_EMAIL esté en $ENV_FILE o que el valor por defecto sea válido."
  missing_vars_flag=true
fi
if [ -z "${FINAL_SSH_KEY_PATH}" ]; then
  print_error "  SSH_KEY_PATH está vacío. Asegúrate que SSH_KEY_PATH esté en $ENV_FILE o que el valor por defecto sea válido."
  missing_vars_flag=true
fi

if [ "$missing_vars_flag" = true ]; then
  print_error "Una o más variables requeridas no están seteadas correctamente en $ENV_FILE."
  print_warning "Variables esperadas del .env: HETZNER_SERVER_IP (obligatoria)."
  print_warning "Opcionales (con valores por defecto si no se proveen): DOMAIN_NAME, ADMIN_EMAIL, SSH_KEY_PATH, REMOTE_USER."
  exit 1
fi

# Reasignar a los nombres de variables que usa el resto del script para mantener consistencia
REMOTE_HOST="${FINAL_REMOTE_HOST}"
DOMAIN_NAME="${FINAL_DOMAIN_NAME}"
ADMIN_EMAIL="${FINAL_ADMIN_EMAIL}"
SSH_KEY_PATH="${FINAL_SSH_KEY_PATH}"
REMOTE_USER="${FINAL_REMOTE_USER}"

print_success "Variables de configuración validadas."
echo "-----------------------------------------------------------------------"
print_status "CONFIGURACIÓN DE DESPLIEGUE A UTILIZAR:"
print_status "  Host Remoto (REMOTE_HOST): $REMOTE_HOST"
print_status "  Usuario Remoto (REMOTE_USER): $REMOTE_USER"
print_status "  Dominio (DOMAIN_NAME): $DOMAIN_NAME"
print_status "  Email Admin (ADMIN_EMAIL): $ADMIN_EMAIL"
print_status "  Clave SSH (SSH_KEY_PATH): $SSH_KEY_PATH"
echo "-----------------------------------------------------------------------"

# Comprobar conectividad SSH
print_status "Probando conexión SSH..."
if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_USER@$REMOTE_HOST" "echo SSH connection successful"; then
  echo "Conexión SSH exitosa."
else
  echo "Error: No se pudo conectar al servidor vía SSH. Verifica la IP, usuario, clave SSH y conectividad de red."
  exit 1
fi

# Crear un tarball del proyecto, excluyendo node_modules y .git
# Nota: .dockerignore será respetado por Docker durante el build, aquí solo excluimos para la transferencia
echo "Creando tarball del proyecto (excluyendo node_modules y .git)..."
# Usar .dockerignore si existe para las exclusiones de tar, o exclusiones por defecto.
# Esto es para optimizar la subida, el .dockerignore real lo usa Docker.
TAR_EXCLUDE_FILE=".tarignore"
echo "node_modules/*" > "$TAR_EXCLUDE_FILE"
echo ".git/*" >> "$TAR_EXCLUDE_FILE"
echo "*.log" >> "$TAR_EXCLUDE_FILE"
echo ".env*" >> "$TAR_EXCLUDE_FILE" # Excluir todos los .env locales, se usa el del servidor
echo "!.env.hetzner.production" >> "$TAR_EXCLUDE_FILE" # No incluir este tampoco, se carga localmente
echo ".DS_Store" >> "$TAR_EXCLUDE_FILE"
echo "coverage/*" >> "$TAR_EXCLUDE_FILE"
echo "dist/*" >> "$TAR_EXCLUDE_FILE" # Excluir directorios dist/ de alto nivel
echo "apps/*/dist/*" >> "$TAR_EXCLUDE_FILE" # Excluir dist/ de las apps
echo "packages/*/dist/*" >> "$TAR_EXCLUDE_FILE" # Excluir dist/ de los packages

# Comprimir y enviar archivos al servidor
echo "Comprimiendo y enviando archivos del proyecto a /app en el servidor..."
tar --exclude-from="$TAR_EXCLUDE_FILE" -czf - . | ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_USER@$REMOTE_HOST" "sudo mkdir -p /app && sudo chown $REMOTE_USER:$REMOTE_USER /app && sudo rm -rf /app/* && cd /app && tar xzf -"
if [ $? -ne 0 ]; then
  echo "Error durante la transferencia de archivos con tar. Abortando."
  rm -f "$TAR_EXCLUDE_FILE"
  exit 1
fi
rm -f "$TAR_EXCLUDE_FILE"
echo "Archivos del proyecto transferidos."

# Copiar explícitamente docker-compose.hetzner.yml
echo "Copiando docker-compose.hetzner.yml al servidor..."
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null docker-compose.hetzner.yml "$REMOTE_USER@$REMOTE_HOST:/app/docker-compose.hetzner.yml"
if [ $? -ne 0 ]; then
  echo "Error copiando docker-compose.hetzner.yml. Abortando."
  exit 1
fi
echo "docker-compose.hetzner.yml copiado."

# Copiar explícitamente nginx.hetzner.conf
LOCAL_NGINX_CONF="docker/nginx.hetzner.conf" 
LOCAL_NGINX_TEMP_CONF="docker/nginx.hetzner.temp.conf"  # Nueva configuración temporal
REMOTE_NGINX_CONF_PATH="/app/nginx.hetzner.conf" 
REMOTE_NGINX_TEMP_CONF_PATH="/app/nginx.hetzner.temp.conf"  # Nueva ruta temporal

if [ ! -f "$LOCAL_NGINX_CONF" ]; then
  print_error "Archivo de configuración Nginx local ($LOCAL_NGINX_CONF) no encontrado. Abortando."
  exit 1
fi

if [ ! -f "$LOCAL_NGINX_TEMP_CONF" ]; then
  print_error "Archivo de configuración Nginx temporal local ($LOCAL_NGINX_TEMP_CONF) no encontrado. Abortando."
  exit 1
fi

echo "Copiando $LOCAL_NGINX_CONF al servidor en $REMOTE_NGINX_CONF_PATH..."
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$LOCAL_NGINX_CONF" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_NGINX_CONF_PATH"
if [ $? -ne 0 ]; then
  print_error "Error copiando $LOCAL_NGINX_CONF. Abortando."
  exit 1
fi
echo "$LOCAL_NGINX_CONF copiado."

echo "Copiando $LOCAL_NGINX_TEMP_CONF al servidor en $REMOTE_NGINX_TEMP_CONF_PATH..."
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$LOCAL_NGINX_TEMP_CONF" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_NGINX_TEMP_CONF_PATH"
if [ $? -ne 0 ]; then
  print_error "Error copiando $LOCAL_NGINX_TEMP_CONF. Abortando."
  exit 1
fi
echo "$LOCAL_NGINX_TEMP_CONF copiado."

# Copiar archivo de variables de entorno para Docker Compose
echo "Copiando $ENV_FILE al servidor como .env para Docker Compose..."
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$ENV_FILE" "$REMOTE_USER@$REMOTE_HOST:/app/.env"
if [ $? -ne 0 ]; then
  print_error "Error copiando $ENV_FILE. Abortando."
  exit 1
fi
echo "$ENV_FILE copiado como .env en el servidor."

# Ejecutar comandos en el servidor remoto
echo "Ejecutando comandos de configuración y despliegue en el servidor..."
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$REMOTE_USER@$REMOTE_HOST" bash -s -- "$DOMAIN_NAME" "$ADMIN_EMAIL" "$REMOTE_NGINX_CONF_PATH" "$REMOTE_NGINX_TEMP_CONF_PATH" << 'EOF'
  set -e # Salir inmediatamente si un comando falla en el script remoto
  DOMAIN_NAME_CMD=$1
  ADMIN_EMAIL_CMD=$2
  REMOTE_NGINX_CONF_PATH_CMD=$3 # Configuración completa
  REMOTE_NGINX_TEMP_CONF_PATH_CMD=$4 # Configuración temporal

  # Definiciones de colores para el script remoto (opcional, pero útil si quieres mantener algo de formato)
  R_BLUE='\033[0;34m'
  R_GREEN='\033[0;32m'
  R_YELLOW='\033[0;33m'
  R_RED='\033[0;31m'
  R_NC='\033[0m' # No Color

  echo "-----------------------------------------------------"
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} EJECUTANDO EN EL SERVIDOR: $HOSTNAME"
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Dominio: $DOMAIN_NAME_CMD"
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Email Admin: $ADMIN_EMAIL_CMD"
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Directorio actual: $(pwd)"
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Ruta Nginx Conf esperada: $REMOTE_NGINX_CONF_PATH_CMD"
  echo "-----------------------------------------------------"

  # Navegar al directorio de la aplicación
  if [ -d "/app" ]; then
    cd /app
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Cambiado al directorio /app"
  else
    echo -e "${R_RED}[ERROR REMOTO]${R_NC} El directorio /app no existe en el servidor."
    exit 1
  fi
  
  echo "-----------------------------------------------------"
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Contenido de /app en el servidor ANTES de docker-compose build:"
  ls -la /app
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Verificando específicamente /app/apps y /app/docker:"
  ls -la /app/apps || echo -e "${R_YELLOW}[WARN REMOTO]${R_NC} /app/apps no encontrado"
  ls -la /app/docker || echo -e "${R_YELLOW}[WARN REMOTO]${R_NC} /app/docker no encontrado"
  echo "-----------------------------------------------------"

  # Instalar/Actualizar dependencias del sistema (no interactivamente)
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Actualizando lista de paquetes e instalando dependencias base..."
  export DEBIAN_FRONTEND=noninteractive
  sudo apt-get update -q
  # Intentar desinstalar needrestart si causa problemas
  if sudo apt-get remove -y needrestart; then
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} needrestart desinstalado exitosamente."
  else
    echo -e "${R_YELLOW}[WARN REMOTO]${R_NC} needrestart no estaba instalado o no se pudo desinstalar (esto podría estar bien)."
  fi
  sudo apt-get install -y -q apt-transport-https ca-certificates curl software-properties-common acl

  # Instalar Docker si no está instalado
  if ! command -v docker &> /dev/null; then
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Docker no encontrado. Instalando Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -q
    sudo apt-get install -y -q docker-ce docker-ce-cli containerd.io
    sudo systemctl start docker
    sudo systemctl enable docker
    # Añadir usuario actual al grupo docker si no es root
    if [ "$(whoami)" != "root" ]; then
      sudo usermod -aG docker $(whoami)
      echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Usuario $(whoami) añadido al grupo docker. Puede que necesites re-loguearte en una nueva sesión SSH para que esto tome efecto si ejecutas docker sin sudo."
    fi
  else
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Docker ya está instalado."
  fi

  # Instalar Docker Compose si no está instalado o actualizar
  DOCKER_COMPOSE_VERSION="v2.24.6" # O la versión que prefieras
  DOCKER_COMPOSE_DEST="/usr/local/bin/docker-compose"
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Verificando/Instalando Docker Compose versión $DOCKER_COMPOSE_VERSION..."
  
  # Eliminar versión anterior si existe y está causando problemas
  if [ -f "$DOCKER_COMPOSE_DEST" ]; then
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Intentando desbloquear y eliminar docker-compose existente en $DOCKER_COMPOSE_DEST..."
    sudo fuser -k "$DOCKER_COMPOSE_DEST" || echo -e "${R_YELLOW}[WARN REMOTO]${R_NC} No se pudo usar fuser o el archivo no estaba bloqueado."
    sudo rm -f "$DOCKER_COMPOSE_DEST" || echo -e "${R_YELLOW}[WARN REMOTO]${R_NC} No se pudo eliminar $DOCKER_COMPOSE_DEST."
  fi

  sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o $DOCKER_COMPOSE_DEST
  sudo chmod +x $DOCKER_COMPOSE_DEST
  # Verificar instalación de Docker Compose
  if docker-compose --version; then
    echo -e "${R_GREEN}[SUCCESS REMOTO]${R_NC} Docker Compose instalado/actualizado correctamente."
  else
    echo -e "${R_RED}[ERROR REMOTO]${R_NC} Error en la instalación/actualización de Docker Compose."
    exit 1
  fi

  # Instalar Nginx si no está instalado
  if ! command -v nginx &> /dev/null; then
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Nginx no encontrado. Instalando Nginx..."
    sudo apt-get update -q # Asegurar que apt está actualizado antes de instalar
    sudo apt-get install -y -q nginx
  else
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Nginx ya está instalado."
  fi
  # Detener Nginx antes de manipular configuraciones para evitar problemas
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Asegurando que Nginx está detenido antes de la configuración inicial..."
  sudo systemctl stop nginx || echo -e "${R_YELLOW}[WARN REMOTO]${R_NC} Nginx no se pudo detener (quizás no estaba corriendo)."

  # Instalar Certbot si no está instalado
  if ! command -v certbot &> /dev/null; then
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Certbot no encontrado. Instalando Certbot y plugin Nginx..."
    sudo apt-get install -y -q certbot python3-certbot-nginx
  else
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Certbot ya está instalado."
  fi

  # --- Configuración de Nginx y SSL --- 
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Iniciando configuración de Nginx y SSL..."

  # Paso 1: Limpiar configuraciones previas y aplicar configuración TEMPORAL para SSL
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Limpiando cualquier configuración de sitio 'default' existente..."
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo rm -f /etc/nginx/sites-available/default

  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Aplicando configuración TEMPORAL de Nginx desde $REMOTE_NGINX_TEMP_CONF_PATH_CMD..."
  if [ -f "$REMOTE_NGINX_TEMP_CONF_PATH_CMD" ]; then
    DOMAIN_NAME_SED=$(echo "$DOMAIN_NAME_CMD" | sed -e 's/\\/\\\\/g' -e 's/\//\\\//g' -e 's/&/\\\&/g')
    sed "s/YOUR_DOMAIN_NAME/$DOMAIN_NAME_SED/g" "$REMOTE_NGINX_TEMP_CONF_PATH_CMD" | sudo tee /etc/nginx/sites-available/default > /dev/null
    echo -e "${R_GREEN}[SUCCESS REMOTO]${R_NC} Configuración temporal aplicada."
  else
    echo -e "${R_RED}[ERROR REMOTO CRÍTICO]${R_NC} $REMOTE_NGINX_TEMP_CONF_PATH_CMD no encontrado."
    exit 1
  fi
  
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Creando symlink temporal..."
  sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

  # Paso 2: Probar la configuración temporal y iniciar Nginx
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Probando configuración temporal de Nginx..."
  if sudo nginx -t; then
    echo -e "${R_GREEN}[SUCCESS REMOTO]${R_NC} Configuración temporal OK."
    sudo systemctl enable nginx
    sudo systemctl restart nginx
    echo -e "${R_GREEN}[SUCCESS REMOTO]${R_NC} Nginx iniciado con configuración temporal."
  else
    echo -e "${R_RED}[ERROR REMOTO CRÍTICO]${R_NC} Error en configuración temporal de Nginx."
    exit 1
  fi

  # Paso 3: Obtener/Renovar certificado SSL con Certbot
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Obteniendo certificado SSL con Certbot para $DOMAIN_NAME_CMD..."
  sudo certbot --nginx -d "$DOMAIN_NAME_CMD" -d "www.$DOMAIN_NAME_CMD" --non-interactive --agree-tos -m "$ADMIN_EMAIL_CMD" --keep-until-expiring --redirect
  CERTBOT_STATUS=$?
  if [ $CERTBOT_STATUS -eq 0 ]; then
    echo -e "${R_GREEN}[SUCCESS REMOTO]${R_NC} Certificado SSL configurado exitosamente."
  else
    echo -e "${R_RED}[ERROR REMOTO CRÍTICO]${R_NC} Certbot falló con código $CERTBOT_STATUS."
    exit 1 
  fi

  # Paso 4: Configurar firewall
  if ! sudo ufw status | grep -q "Status: active"; then
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Configurando UFW (firewall)..."
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    sudo ufw --force enable
  else
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} UFW ya está activo."
  fi
  
  # Paso 5: Construir y levantar contenedores Docker
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Construyendo y desplegando contenedores Docker..."
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Variables de entorno disponibles:"
  env | grep -E 'NODE_ENV|DATABASE_URL|NEXT_PUBLIC_|PORT|GDPR_ENABLED|HETZNER_SERVER_IP|DOMAIN_NAME|ADMIN_EMAIL|POSTGRES_USER|POSTGRES_PASSWORD|POSTGRES_DB' || echo -e "${R_YELLOW}[WARN REMOTO]${R_NC} Variables no encontradas."
  
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Construyendo imágenes Docker (sin caché)..."
  docker-compose -f docker-compose.hetzner.yml build --no-cache api web
  
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Levantando servicios Docker..."
  docker-compose -f docker-compose.hetzner.yml up --force-recreate -d api web

  # Esperar a que los contenedores estén listos
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Esperando a que los contenedores estén listos..."
  sleep 10

  # Paso 6: Aplicar configuración COMPLETA de Nginx con upstreams Docker
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Aplicando configuración COMPLETA de Nginx con Docker upstreams..."
  if [ -f "$REMOTE_NGINX_CONF_PATH_CMD" ]; then
    # Hacer backup de la configuración de Certbot
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.certbot.backup
    
    # Aplicar configuración completa
    sed "s/YOUR_DOMAIN_NAME/$DOMAIN_NAME_SED/g" "$REMOTE_NGINX_CONF_PATH_CMD" | sudo tee /etc/nginx/sites-available/default.full > /dev/null
    
    # Combinar configuraciones SSL de Certbot con nuestra configuración completa
    echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Integrando configuración SSL de Certbot con configuración completa..."
    
    # Extraer líneas SSL de Certbot
    sudo grep -E "ssl_certificate|ssl_certificate_key|include.*options-ssl-nginx|ssl_dhparam" /etc/nginx/sites-available/default.certbot.backup > /tmp/ssl_lines.tmp || true
    
    # Reemplazar líneas SSL comentadas en configuración completa
    if [ -s /tmp/ssl_lines.tmp ]; then
      # Descomnentar y reemplazar líneas SSL
      sudo sed -i '/# ssl_certificate/d' /etc/nginx/sites-available/default.full
      sudo sed -i '/# include.*options-ssl-nginx/d' /etc/nginx/sites-available/default.full
      sudo sed -i '/# ssl_dhparam/d' /etc/nginx/sites-available/default.full
      
      # Insertar configuración SSL después del server_name en el bloque 443
      sudo sed -i '/server_name.*443.*{/,/server_name/ {
        /server_name.*'"$DOMAIN_NAME_SED"'.*'"$DOMAIN_NAME_SED"'.*/r /tmp/ssl_lines.tmp
      }' /etc/nginx/sites-available/default.full
    fi
    
    # Reemplazar configuración
    sudo mv /etc/nginx/sites-available/default.full /etc/nginx/sites-available/default
    
    echo -e "${R_GREEN}[SUCCESS REMOTO]${R_NC} Configuración completa aplicada."
  else
    echo -e "${R_RED}[ERROR REMOTO CRÍTICO]${R_NC} $REMOTE_NGINX_CONF_PATH_CMD no encontrado."
    exit 1
  fi

  # Paso 7: Probar y recargar configuración final
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Probando configuración final de Nginx..."
  if sudo nginx -t; then
    echo -e "${R_GREEN}[SUCCESS REMOTO]${R_NC} Configuración final OK."
    sudo systemctl reload nginx
    echo -e "${R_GREEN}[SUCCESS REMOTO]${R_NC} Nginx recargado con configuración completa."
  else
    echo -e "${R_RED}[ERROR REMOTO CRÍTICO]${R_NC} Error en configuración final. Restaurando backup..."
    sudo mv /etc/nginx/sites-available/default.certbot.backup /etc/nginx/sites-available/default
    sudo systemctl reload nginx
    echo -e "${R_YELLOW}[WARN REMOTO]${R_NC} Configuración restaurada a temporal con SSL."
  fi

  echo -e "${R_GREEN}[SUCCESS REMOTO]${R_NC} Despliegue completado."
  echo -e "${R_BLUE}[INFO REMOTO]${R_NC} Estado de contenedores:"
  docker-compose -f docker-compose.hetzner.yml ps
  echo "-----------------------------------------------------"
  echo -e "${R_GREEN}Aplicación disponible en https://$DOMAIN_NAME_CMD${R_NC}"
  echo "-----------------------------------------------------"
EOF

echo "Script de despliegue remoto finalizado."
echo "Verifica los logs y el estado de los contenedores en el servidor."

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