#!/bin/bash

# ========================================
# COSMO - AUTOMATED BACKUP SCRIPT (GDPR)
# ========================================

set -e

# Variables
BACKUP_DIR="/backup"
POSTGRES_HOST="postgres"
POSTGRES_PORT="5432"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

# Función para logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "🔄 Iniciando backup automatizado..."

# Backup de PostgreSQL
log "📦 Creando backup de PostgreSQL..."
pg_dump -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB \
    --no-password --verbose --clean --no-acl --no-owner \
    --format=custom > $BACKUP_DIR/postgres_backup_$DATE.dump

# Comprimir backup
log "🗜️ Comprimiendo backup..."
gzip $BACKUP_DIR/postgres_backup_$DATE.dump

# Crear backup de configuración
log "⚙️ Backup de configuración..."
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz \
    /app/docker/nginx.hetzner.conf \
    /app/docker-compose.hetzner.yml \
    /app/.env

# Eliminar backups antiguos (GDPR compliance)
log "🧹 Limpiando backups antiguos (>$RETENTION_DAYS días)..."
find $BACKUP_DIR -name "*.dump.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Verificar espacio disponible
SPACE_USED=$(df $BACKUP_DIR | awk 'NR==2 {print $5}' | sed 's/%//')
log "💾 Espacio usado en backup: $SPACE_USED%"

if [ $SPACE_USED -gt 80 ]; then
    log "⚠️ ADVERTENCIA: Espacio de backup por encima del 80%"
    # Eliminar backups más antiguos si es necesario
    find $BACKUP_DIR -name "*.dump.gz" -mtime +7 -delete
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
fi

# Listar backups existentes
log "📋 Backups existentes:"
ls -lah $BACKUP_DIR/

log "✅ Backup completado exitosamente"

# Opcional: Subir a almacenamiento externo (descomenta si usas S3, etc.)
# log "☁️ Subiendo a almacenamiento externo..."
# aws s3 cp $BACKUP_DIR/postgres_backup_$DATE.dump.gz s3://tu-bucket/backups/ 