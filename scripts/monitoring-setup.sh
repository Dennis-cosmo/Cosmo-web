#!/bin/bash

# =========================================
# COSMO - Monitoring Setup Script
# =========================================

set -e

echo "📊 Configurando monitoreo para Cosmo..."

# Instalar herramientas de monitoreo
sudo apt update
sudo apt install -y htop iotop nethogs mailutils

# Obtener dominio del archivo .env
DOMAIN=$(grep "^DOMAIN=" .env.production | cut -d'=' -f2)

# Crear script de health check
cat > ~/health-check.sh << EOF
#!/bin/bash

# Configuración
DOMAIN="$DOMAIN"
LOG_FILE="/home/cosmo/monitoring.log"
ERROR_LOG="/home/cosmo/errors.log"

# Función para log
log_message() {
    echo "\$(date): \$1" >> \$LOG_FILE
}

log_error() {
    echo "\$(date): ERROR - \$1" >> \$ERROR_LOG
    echo "\$(date): ERROR - \$1" >> \$LOG_FILE
}

# Verificar sitio web
if ! curl -f -s https://\$DOMAIN/health > /dev/null; then
    log_error "Website down: https://\$DOMAIN"
else
    log_message "Website OK: https://\$DOMAIN"
fi

# Verificar API
if ! curl -f -s https://\$DOMAIN/api/health > /dev/null; then
    log_error "API down: https://\$DOMAIN/api"
else
    log_message "API OK: https://\$DOMAIN/api"
fi

# Verificar uso de disco
DISK_USAGE=\$(df / | tail -1 | awk '{print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    log_error "High disk usage: \${DISK_USAGE}%"
fi

# Verificar uso de memoria
MEM_USAGE=\$(free | grep Mem | awk '{printf("%.0f", \$3/\$2 * 100.0)}')
if [ \$MEM_USAGE -gt 85 ]; then
    log_error "High memory usage: \${MEM_USAGE}%"
fi

# Verificar que los contenedores estén corriendo
CONTAINERS=("cosmo-nginx-prod" "cosmo-web-prod" "cosmo-api-prod" "cosmo-postgres-prod" "cosmo-redis-prod")
for container in "\${CONTAINERS[@]}"; do
    if ! docker ps | grep -q "\$container"; then
        log_error "Container not running: \$container"
    fi
done
EOF

# Hacer ejecutable
chmod +x ~/health-check.sh

# Configurar cron job para health checks cada 5 minutos
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/cosmo/health-check.sh") | crontab -

# Crear script de reporte diario
cat > ~/daily-report.sh << EOF
#!/bin/bash

DOMAIN="$DOMAIN"
REPORT_FILE="/home/cosmo/daily-report.txt"

echo "=== COSMO DAILY REPORT - \$(date) ===" > \$REPORT_FILE
echo "" >> \$REPORT_FILE

echo "📊 SYSTEM STATUS:" >> \$REPORT_FILE
echo "Uptime: \$(uptime)" >> \$REPORT_FILE
echo "Disk Usage: \$(df -h / | tail -1)" >> \$REPORT_FILE
echo "Memory Usage: \$(free -h)" >> \$REPORT_FILE
echo "" >> \$REPORT_FILE

echo "🐳 DOCKER CONTAINERS:" >> \$REPORT_FILE
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" >> \$REPORT_FILE
echo "" >> \$REPORT_FILE

echo "📈 CONTAINER STATS:" >> \$REPORT_FILE
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" >> \$REPORT_FILE
echo "" >> \$REPORT_FILE

echo "🔍 RECENT ERRORS (Last 24h):" >> \$REPORT_FILE
if [ -f "/home/cosmo/errors.log" ]; then
    tail -50 /home/cosmo/errors.log | grep "\$(date +'%Y-%m-%d')" >> \$REPORT_FILE || echo "No errors found" >> \$REPORT_FILE
else
    echo "No error log found" >> \$REPORT_FILE
fi

echo "" >> \$REPORT_FILE
echo "Report generated at: \$(date)" >> \$REPORT_FILE

# Mostrar reporte en consola también
cat \$REPORT_FILE
EOF

# Hacer ejecutable
chmod +x ~/daily-report.sh

# Configurar reporte diario a las 8:00 AM
(crontab -l 2>/dev/null; echo "0 8 * * * /home/cosmo/daily-report.sh >> /home/cosmo/daily-reports.log") | crontab -

echo "✅ Monitoreo configurado exitosamente!"
echo "📊 Health checks cada 5 minutos"
echo "📈 Reporte diario a las 8:00 AM"
echo "📝 Logs en:"
echo "   - ~/monitoring.log (actividad general)"
echo "   - ~/errors.log (solo errores)"
echo "   - ~/daily-reports.log (reportes diarios)"

# Ejecutar primer health check
echo "🧪 Ejecutando primer health check..."
~/health-check.sh

echo "✅ Configuración de monitoreo completada!" 