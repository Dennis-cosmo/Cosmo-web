# 🇩🇪 Guía de Deployment en Hetzner Cloud (GDPR Compliant)

Esta guía te ayudará a desplegar Cosmo en Hetzner Cloud con cumplimiento GDPR completo.

## 📋 Pre-requisitos

### 1. Cuenta Hetzner Cloud

- [ ] Crear cuenta en [Hetzner Cloud](https://www.hetzner.com/cloud)
- [ ] Generar API Token (opcional, para automatización)
- [ ] Crear SSH Key en tu máquina local

### 2. Dominio

- [ ] Tener un dominio registrado (`simplycosmo.com`)
- [ ] Acceso a configuración DNS

### 3. Herramientas locales

- [ ] Docker instalado
- [ ] SSH configurado
- [ ] OpenSSL para generar secretos

## 🚀 Paso a Paso del Deployment

### Paso 1: Crear Servidor en Hetzner

1. **Accede a Hetzner Cloud Console**

   - Ve a [console.hetzner-cloud.de](https://console.hetzner-cloud.de)

2. **Crear nuevo servidor**

   ```
   Tipo: CX21 (2 vCPU, 4 GB RAM) - €4.90/mes
   Imagen: Ubuntu 22.04
   Ubicación: Nuremberg (NBG1) - Para GDPR
   Red: Crear nueva red privada
   SSH Key: Subir tu clave pública
   ```

3. **Anotar la IP pública del servidor**

### Paso 2: Configurar DNS

1. **Configurar registros DNS** para `simplycosmo.com`

   ```
   A     simplycosmo.com       -> IP_DEL_SERVIDOR
   A     www.simplycosmo.com   -> IP_DEL_SERVIDOR
   ```

2. **Esperar propagación DNS** (puede tomar hasta 24 horas)

### Paso 3: Configurar Variables de Entorno

1. **Copiar archivo de variables**

   ```bash
   cp env.hetzner.production env.hetzner.production.local
   ```

2. **Verificar/editar `env.hetzner.production`**

   ```bash
   DOMAIN=simplycosmo.com
   POSTGRES_PASSWORD=tu_password_super_seguro
   REDIS_PASSWORD=tu_redis_password_seguro
   JWT_SECRET=resultado_del_comando_anterior
   NEXTAUTH_SECRET=resultado_del_comando_anterior

   # QuickBooks Production
   QUICKBOOKS_CLIENT_ID=tu_client_id_production
   QUICKBOOKS_CLIENT_SECRET=tu_client_secret_production
   QUICKBOOKS_REDIRECT_URI=https://simplycosmo.com/api/integrations/quickbooks/callback
   QUICKBOOKS_ENVIRONMENT=production

   # AI APIs
   DEEPSEEK_API_KEY=tu_deepseek_key_production
   OPENAI_API_KEY=tu_openai_key_production
   ```

### Paso 4: Ejecutar Deployment

1. **Validar configuración**

   ```bash
   npm run hetzner:validate
   ```

2. **Ejecutar deployment completo**

   ```bash
   npm run hetzner:deploy
   ```

3. **El script te pedirá:**
   - IP del servidor Hetzner
   - Dominio (ya debería tomar `simplycosmo.com` de tu archivo .env)
   - Ruta a tu SSH key (`/Users/is/.ssh/id_ed25519_hetzner`)

### Paso 5: Verificar Deployment

1. **Verificar que la aplicación funciona**

   ```bash
   curl https://simplycosmo.com/health
   ```

2. **Verificar SSL**

   ```bash
   curl -I https://simplycosmo.com
   ```

3. **Ver logs**
   ```bash
   npm run hetzner:logs
   ```

## 🔧 Comandos Útiles Post-Deployment

### Monitoreo

```bash
# Ver estado de contenedores
npm run hetzner:status

# Ver logs en tiempo real
npm run hetzner:logs

# Reiniciar servicios
npm run hetzner:restart

# Crear backup manual
npm run hetzner:backup
```

### SSH al servidor

```bash
ssh -i /Users/is/.ssh/id_ed25519_hetzner root@TU_SERVER_IP
cd /app
docker-compose -f docker-compose.hetzner.yml ps
```

## 🔒 Configuración GDPR Implementada

### Datos y Privacidad

- ✅ Todos los datos almacenados en Alemania (GDPR nativo)
- ✅ IPs anonimizadas en logs de Nginx
- ✅ Headers GDPR en todas las respuestas
- ✅ Retención automática de logs (90 días)
- ✅ Cookies seguras y SameSite=Strict

### Seguridad

- ✅ SSL/TLS obligatorio con Let's Encrypt
- ✅ Headers de seguridad completos
- ✅ Rate limiting por endpoint
- ✅ Firewall configurado
- ✅ Contenedores no-root

### Backups

- ✅ Backup automático diario a las 2 AM
- ✅ Retención automática (30 días por defecto)
- ✅ Backup comprimido y cifrado

### Monitoreo

- ✅ Health checks automáticos
- ✅ Limpieza automática de logs antiguos
- ✅ Reinicio automático de servicios caídos
- ✅ Alertas de espacio en disco

## 🛠️ Troubleshooting

### Error: "SSL Certificate not found"

```bash
# Regenerar certificados SSL
ssh root@TU_SERVER_IP
systemctl stop nginx
certbot certonly --standalone -d simplycosmo.com -d www.simplycosmo.com --email tuemail@example.com --agree-tos --no-eff-email
# Luego copia los certificados como en el script deploy-hetzner.sh y reinicia nginx
```

### Error: "Container won't start"

```bash
# Ver logs específicos
ssh root@TU_SERVER_IP
cd /app
docker-compose -f docker-compose.hetzner.yml logs [servicio]
```

### Error: "Database connection failed"

```bash
# Verificar estado de PostgreSQL
ssh root@TU_SERVER_IP
cd /app
docker-compose -f docker-compose.hetzner.yml exec postgres pg_isready
```

### Error: "QuickBooks integration not working"

- Verificar que `QUICKBOOKS_ENVIRONMENT=production` en `env.hetzner.production`
- Verificar que la URL de callback sea `https://simplycosmo.com/api/integrations/quickbooks/callback`
- Revisar logs: `npm run hetzner:logs`

## 📊 Costos Estimados

### Hetzner Cloud

- **CX21**: €4.90/mes (recomendado para inicio)
- **CX31**: €9.90/mes (para más tráfico)
- **CX41**: €17.90/mes (para alto tráfico)

### Servicios adicionales

- **Backup Space**: €3.24/mes por 100GB
- **Load Balancer**: €4.90/mes (solo si necesitas HA)

### Total estimado: €5-20/mes (muchísimo más barato que Railway/Vercel)

## 🎯 URLs Importantes

Después del deployment exitoso:

- **Frontend**: https://simplycosmo.com
- **API**: https://simplycosmo.com/api
- **Health Check**: https://simplycosmo.com/health
- **QuickBooks Integration**: https://simplycosmo.com/integrations/quickbooks

## 📞 Soporte

Si tienes problemas:

1. Revisar logs: `npm run hetzner:logs`
2. Verificar estado: `npm run hetzner:status`
3. SSH al servidor para diagnóstico detallado
4. Crear issue en el repositorio con logs específicos

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. Hacer cambios en el código
2. Commit y push
3. Ejecutar: `npm run hetzner:deploy`

El script detectará cambios y reconstruirá solo lo necesario.

---

**¡Felicidades! Tu aplicación Cosmo está ahora ejecutándose en Hetzner Cloud con cumplimiento GDPR completo.**
