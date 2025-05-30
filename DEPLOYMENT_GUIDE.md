# 🚀 Guía Completa de Despliegue - Cosmo App

Esta guía te ayudará a desplegar tu aplicación Cosmo en producción usando Docker y las mejores prácticas.

## 📋 Tabla de Contenidos

1. [Arquitectura de Despliegue](#arquitectura)
2. [Requisitos del Servidor](#requisitos)
3. [Configuración del Dominio](#dominio)
4. [Despliegue en VPS](#vps-deployment)
5. [Configuración SSL](#ssl)
6. [Monitoreo y Mantenimiento](#monitoring)
7. [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura de Despliegue {#arquitectura}

```
Internet → Nginx (Reverse Proxy) → Frontend (Next.js) + API (NestJS)
                                 ↓
                            PostgreSQL + Redis
```

**Servicios incluidos:**

- ✅ **Nginx**: Reverse proxy con SSL y rate limiting
- ✅ **Frontend**: Next.js app (puerto 3000)
- ✅ **Backend API**: NestJS API (puerto 4000)
- ✅ **PostgreSQL**: Base de datos principal
- ✅ **Redis**: Cache y sesiones

## 💻 Requisitos del Servidor {#requisitos}

### Especificaciones Mínimas Recomendadas:

- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Almacenamiento**: 50GB SSD
- **Sistema Operativo**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Docker**: v20.10+
- **Docker Compose**: v2.0+

### Proveedores Recomendados:

1. **DigitalOcean** - $24/mes (4GB RAM, 2 vCPUs, 80GB SSD)
2. **Hetzner** - $16/mes (4GB RAM, 2 vCPUs, 80GB SSD)
3. **Linode** - $24/mes (4GB RAM, 2 vCPUs, 80GB SSD)
4. **Vultr** - $24/mes (4GB RAM, 2 vCPUs, 80GB SSD)

## 🌐 Configuración del Dominio {#dominio}

### 1. Configurar DNS en Squarespace

En tu panel de Squarespace:

1. Ve a **Settings** → **Domains** → **DNS Settings**
2. Agrega los siguientes registros:

```
Tipo    Nombre    Valor                TTL
A       @         [IP_DE_TU_SERVIDOR]  300
A       www       [IP_DE_TU_SERVIDOR]  300
CNAME   api       tudominio.com        300
```

### 2. Verificar Propagación DNS

```bash
# Verificar que el dominio apunte a tu servidor
dig tudominio.com
nslookup tudominio.com
```

## 🖥️ Despliegue en VPS {#vps-deployment}

### Paso 1: Configurar el Servidor

```bash
# Conectarse al servidor
ssh root@TU_IP_SERVIDOR

# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar herramientas adicionales
apt install -y git htop curl wget unzip
```

### Paso 2: Configurar Usuario de Despliegue

```bash
# Crear usuario para la aplicación
adduser cosmo
usermod -aG docker cosmo
usermod -aG sudo cosmo

# Cambiar a usuario cosmo
su - cosmo
```

### Paso 3: Clonar y Configurar el Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/cosmo-app.git
cd cosmo-app

# Copiar y configurar variables de entorno
cp env.production.sample .env.production

# IMPORTANTE: Editar el archivo .env.production
nano .env.production
```

### Paso 4: Configurar Variables de Entorno

Edita `.env.production` con tus valores reales:

```bash
# Domain Configuration
DOMAIN=tudominio.com
FRONTEND_URL=https://tudominio.com

# Database Configuration (CAMBIAR ESTOS VALORES)
POSTGRES_USER=cosmo_prod_user
POSTGRES_PASSWORD=TU_PASSWORD_SUPER_SEGURO_RANDOM_123456
POSTGRES_DB=cosmo_production

# Redis Configuration (CAMBIAR ESTE VALOR)
REDIS_PASSWORD=TU_REDIS_PASSWORD_SEGURO_789012

# JWT & Authentication (GENERAR VALORES ÚNICOS)
JWT_SECRET=TU_JWT_SECRET_DEBE_SER_MUY_LARGO_Y_ALEATORIO_MINIMO_64_CARACTERES
NEXTAUTH_SECRET=OTRO_SECRET_DIFERENTE_PARA_NEXTAUTH_TAMBIEN_LARGO_Y_ALEATORIO

# AI Configuration
DEEPSEEK_API_KEY=tu_deepseek_api_key_real
OPENAI_API_KEY=tu_openai_api_key_real
```

### Paso 5: Desplegar la Aplicación

```bash
# Ejecutar el script de despliegue
./scripts/deploy.sh
```

## 🔒 Configuración SSL {#ssl}

### Opción 1: Let's Encrypt (Recomendado)

```bash
# Instalar certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Parar nginx temporalmente
docker-compose -f docker-compose.production.yml stop nginx

# Obtener certificado
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com

# Copiar certificados al proyecto
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem ./docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem ./docker/ssl/key.pem
sudo chown cosmo:cosmo ./docker/ssl/*.pem

# Reiniciar nginx
docker-compose -f docker-compose.production.yml start nginx
```

### Opción 2: Certificado Personalizado

Si tienes tu propio certificado SSL:

```bash
# Copiar tus certificados
cp tu-certificado.crt ./docker/ssl/cert.pem
cp tu-clave-privada.key ./docker/ssl/key.pem
```

### Configurar Renovación Automática

```bash
# Crear script de renovación
sudo nano /etc/cron.d/certbot-renew

# Contenido del archivo:
0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "cd /home/cosmo/cosmo-app && docker-compose -f docker-compose.production.yml restart nginx"
```

## 📊 Monitoreo y Mantenimiento {#monitoring}

### Comandos Útiles de Monitoreo

```bash
# Ver estado de todos los servicios
docker-compose -f docker-compose.production.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.production.yml logs -f api

# Ver uso de recursos
docker stats

# Verificar salud de la aplicación
curl https://tudominio.com/health
curl https://tudominio.com/api/health
```

### Configurar Backups Automáticos

```bash
# Crear script de backup
nano ~/backup-cosmo.sh

#!/bin/bash
BACKUP_DIR="/home/cosmo/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de la base de datos
docker exec cosmo-postgres-prod pg_dump -U cosmo_prod_user cosmo_production > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup de volúmenes de datos
docker run --rm -v cosmo_postgres-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_data_$DATE.tar.gz -C /data .
docker run --rm -v cosmo_redis-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/redis_data_$DATE.tar.gz -C /data .

# Limpiar backups antiguos (mantener solo los últimos 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"

# Hacer ejecutable
chmod +x ~/backup-cosmo.sh

# Programar backup diario
crontab -e
# Agregar línea:
0 2 * * * /home/cosmo/backup-cosmo.sh >> /home/cosmo/backup.log 2>&1
```

### Configurar Monitoreo de Uptime

```bash
# Instalar herramientas de monitoreo
sudo apt install -y htop iotop nethogs

# Script de monitoreo de salud
nano ~/health-check.sh

#!/bin/bash
DOMAIN="tudominio.com"
EMAIL="tu-email@gmail.com"

# Verificar que la web esté accesible
if ! curl -f -s https://$DOMAIN/health > /dev/null; then
    echo "⚠️ Website down: https://$DOMAIN" | mail -s "ALERT: $DOMAIN is DOWN" $EMAIL
fi

# Verificar API
if ! curl -f -s https://$DOMAIN/api/health > /dev/null; then
    echo "⚠️ API down: https://$DOMAIN/api" | mail -s "ALERT: $DOMAIN API is DOWN" $EMAIL
fi

# Verificar uso de disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ High disk usage: ${DISK_USAGE}%" | mail -s "ALERT: High disk usage on $DOMAIN" $EMAIL
fi

# Hacer ejecutable
chmod +x ~/health-check.sh

# Ejecutar cada 5 minutos
crontab -e
# Agregar línea:
*/5 * * * * /home/cosmo/health-check.sh
```

## 🔧 Troubleshooting {#troubleshooting}

### Problemas Comunes

#### 1. **Los contenedores no inician**

```bash
# Ver logs detallados
docker-compose -f docker-compose.production.yml logs

# Verificar configuración
docker-compose -f docker-compose.production.yml config

# Reconstruir todo desde cero
docker-compose -f docker-compose.production.yml down -v
docker system prune -a
./scripts/deploy.sh
```

#### 2. **Error de conexión a la base de datos**

```bash
# Verificar que PostgreSQL esté ejecutándose
docker exec -it cosmo-postgres-prod psql -U cosmo_prod_user -d cosmo_production

# Verificar las variables de entorno
docker exec cosmo-api-prod env | grep DATABASE_URL
```

#### 3. **SSL/HTTPS no funciona**

```bash
# Verificar certificados
openssl x509 -in ./docker/ssl/cert.pem -text -noout

# Verificar configuración de nginx
docker exec cosmo-nginx-prod nginx -t

# Recargar configuración
docker-compose -f docker-compose.production.yml restart nginx
```

#### 4. **Error 502 Bad Gateway**

```bash
# Verificar que el backend esté corriendo
docker logs cosmo-api-prod

# Verificar conectividad interna
docker exec cosmo-nginx-prod wget -O- http://api:4000/health
```

#### 5. **Performance lenta**

```bash
# Verificar uso de recursos
docker stats

# Verificar logs de la aplicación
docker-compose -f docker-compose.production.yml logs api | grep ERROR

# Optimizar base de datos
docker exec cosmo-postgres-prod psql -U cosmo_prod_user -d cosmo_production -c "VACUUM ANALYZE;"
```

### Comandos de Mantenimiento

```bash
# Reiniciar todos los servicios
docker-compose -f docker-compose.production.yml restart

# Actualizar solo la aplicación (sin rebuild)
git pull origin main
docker-compose -f docker-compose.production.yml up -d --no-deps api web

# Actualizar con rebuild completo
./scripts/deploy.sh

# Limpiar espacio en disco
docker system prune -f
docker volume prune -f
docker image prune -a -f
```

## 📞 Soporte

Si tienes problemas durante el despliegue:

1. **Revisa los logs**: `docker-compose -f docker-compose.production.yml logs`
2. **Verifica la configuración**: `docker-compose -f docker-compose.production.yml config`
3. **Consulta esta guía**: Busca tu problema específico en la sección troubleshooting

---

## ✅ Checklist Post-Despliegue

- [ ] ✅ Todos los servicios están corriendo
- [ ] ✅ El sitio web es accesible via HTTPS
- [ ] ✅ La API responde correctamente
- [ ] ✅ Los certificados SSL están configurados
- [ ] ✅ Los backups automáticos están programados
- [ ] ✅ El monitoreo de salud está activo
- [ ] ✅ Las variables de entorno están configuradas correctamente
- [ ] ✅ El DNS está apuntando al servidor
- [ ] ✅ Los logs se están generando correctamente

**¡Felicidades! Tu aplicación Cosmo está desplegada en producción** 🎉
