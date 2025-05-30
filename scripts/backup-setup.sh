#!/bin/bash

# =========================================
# COSMO - Backup Setup Script
# =========================================

set -e

echo "🔧 Configurando backups automáticos para Cosmo..."

# Crear directorio de backups
mkdir -p ~/backups

# Crear script de backup
cat > ~/backup-cosmo.sh << 'EOF'
#!/bin/bash

# Configuración
BACKUP_DIR="/home/cosmo/backups"
DATE=$(date +%Y%m%d_%H%M%S)
MAX_BACKUPS=7

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

echo "$(date): Iniciando backup..." >> $BACKUP_DIR/backup.log

# Obtener variables de entorno
cd /home/cosmo/cosmo-app
export $(cat .env.production | grep -E '^(POSTGRES_USER|POSTGRES_DB)=' | xargs)

# Backup de la base de datos
echo "$(date): Backing up database..." >> $BACKUP_DIR/backup.log
docker exec cosmo-postgres-prod pg_dump -U $POSTGRES_USER $POSTGRES_DB > "$BACKUP_DIR/db_backup_$DATE.sql"

if [ $? -eq 0 ]; then
    echo "$(date): Database backup completed successfully" >> $BACKUP_DIR/backup.log
else
    echo "$(date): ERROR: Database backup failed" >> $BACKUP_DIR/backup.log
    exit 1
fi

# Backup de volúmenes de datos
echo "$(date): Backing up data volumes..." >> $BACKUP_DIR/backup.log
docker run --rm -v cosmo_postgres-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_data_$DATE.tar.gz -C /data .
docker run --rm -v cosmo_redis-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/redis_data_$DATE.tar.gz -C /data .

# Limpiar backups antiguos
echo "$(date): Cleaning old backups..." >> $BACKUP_DIR/backup.log
find $BACKUP_DIR -name "*.sql" -mtime +$MAX_BACKUPS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$MAX_BACKUPS -delete

echo "$(date): Backup completed successfully" >> $BACKUP_DIR/backup.log
echo "Backup completed: $DATE"
EOF

# Hacer ejecutable
chmod +x ~/backup-cosmo.sh

# Configurar cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /home/cosmo/backup-cosmo.sh >> /home/cosmo/backups/backup.log 2>&1") | crontab -

echo "✅ Backup automático configurado para ejecutarse diariamente a las 2:00 AM"
echo "📁 Los backups se guardarán en: ~/backups/"
echo "📝 Logs en: ~/backups/backup.log"

# Probar backup inmediato
echo "🧪 Ejecutando backup de prueba..."
~/backup-cosmo.sh

echo "✅ Configuración de backups completada!" 