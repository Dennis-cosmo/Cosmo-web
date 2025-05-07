# Cosmo - Plataforma de Finanzas Sostenibles

Cosmo es una plataforma SaaS B2B que automatiza el seguimiento de gastos y sostenibilidad, proporcionando a las empresas las herramientas necesarias para cumplir con normativas europeas de ESG (Environmental, Social, Governance).

## 📋 Características principales

- **Seguimiento automatizado de gastos con enfoque en sostenibilidad**
- **Clasificación inteligente de transacciones verdes/no verdes mediante IA**
- **Integración con sistemas ERP (SAP, QuickBooks, etc.)**
- **Reportes automáticos conformes a normativas europeas**
- **Análisis de huella de carbono y puntuación de sostenibilidad**

## 🏗️ Estructura del Proyecto

Este proyecto utiliza una estructura de monorepo con TurboRepo:

```
cosmo/
├── apps/
│   ├── web/         # Frontend Next.js
│   └── api/         # Backend NestJS
├── packages/
│   ├── database/    # Esquemas y migraciones
│   ├── shared/      # Tipos compartidos, constantes
│   ├── ui/          # Componentes reutilizables
│   └── connectors/  # Integraciones con ERPs
```

## 🛠️ Requisitos previos

- **Node.js**: Versión 18.x o superior
- **Yarn**: Versión 1.22.x o superior
- **Docker y Docker Compose**: Para entorno de desarrollo local
- **Git**: Para clonar el repositorio

## 🚀 Guía de instalación y desarrollo

### 1. Clonar el repositorio

```bash
git clone https://github.com/Dennis-cosmo/Cosmo-web.git
cd Cosmo-web
```

### 2. Configurar variables de entorno

```bash
cp env.sample .env
```

> **Nota**: Edita el archivo `.env` para configurar tus propias variables si es necesario.

### 3. Instalar dependencias

```bash
yarn install
```

### 4. Ejecutar la aplicación completa con Docker (Recomendado)

Este método iniciará todos los servicios necesarios en contenedores Docker (frontend, backend, PostgreSQL y Redis):

```bash
docker compose up -d
```

La aplicación estará disponible en:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:4000](http://localhost:4000)
- **Endpoint de salud del backend**: [http://localhost:4000/health](http://localhost:4000/health)

Para detener los servicios:

```bash
docker compose down
```

Para ver los logs:

```bash
# Todos los servicios
docker compose logs

# Un servicio específico (ej: api)
docker compose logs api

# Seguir los logs en tiempo real
docker compose logs -f
```

### 5. Ejecutar cada servicio de forma independiente (Desarrollo avanzado)

Si prefieres ejecutar los servicios de forma independiente para un desarrollo más específico:

#### Base de datos y Redis

```bash
docker compose up -d postgres redis
```

#### Backend (API)

```bash
cd apps/api
yarn dev
```

El backend estará disponible en [http://localhost:4000](http://localhost:4000)

#### Frontend (Web)

```bash
cd apps/web
yarn dev
```

El frontend estará disponible en [http://localhost:3000](http://localhost:3000)

### 6. Ejecutar toda la aplicación desde la raíz (sin Docker)

Si tienes PostgreSQL y Redis instalados localmente:

```bash
# Asegúrate de actualizar DATABASE_URL y REDIS_URL en el archivo .env para apuntar a localhost
yarn dev
```

## 📊 Base de datos

### Acceder a PostgreSQL

Para interactuar con la base de datos PostgreSQL:

```bash
# Conectar a la base de datos
docker compose exec postgres psql -U postgres -d cosmo

# Ejecutar una consulta específica
docker compose exec postgres psql -U postgres -d cosmo -c "SELECT * FROM users;"
```

### Migraciones

Las migraciones se manejan con TypeORM:

```bash
# Generar una migración
cd packages/database
yarn build
yarn db:generate -n MigracionNombre

# Ejecutar migraciones
yarn db:migrate
```

## 🛠️ Solución de problemas comunes

### Error al iniciar la API

Si encuentras un error EBUSY con el directorio `/app/apps/api/dist`:

1. Detén todos los contenedores: `docker compose down`
2. Elimina el directorio dist localmente: `rm -rf apps/api/dist`
3. Reconstruye el contenedor de la API: `docker compose build api`
4. Reinicia los servicios: `docker compose up -d`

### Problemas de conexión a la base de datos

1. Verifica que las credenciales en el archivo `.env` son correctas
2. Asegúrate de que el contenedor de PostgreSQL está en ejecución: `docker compose ps`
3. Prueba la conexión: `docker compose exec postgres pg_isready -U postgres`

## 🧪 Pruebas

```bash
# Ejecutar todas las pruebas
yarn test

# Ejecutar pruebas específicas
yarn workspace @cosmo/api test
yarn workspace @cosmo/web test
```

## 📚 Tecnologías principales

- **Frontend**: Next.js 14, React Query, TailwindCSS
- **Backend**: NestJS 10, TypeORM, PostgreSQL 15
- **Infraestructura**: Docker, GitHub Actions
- **Cache**: Redis 7

## 📝 Contribuciones

1. Crea un fork del repositorio
2. Crea una rama para tu característica: `git checkout -b feature/amazing-feature`
3. Haz tus cambios y haz commit: `git commit -m 'Add amazing feature'`
4. Sube los cambios a tu fork: `git push origin feature/amazing-feature`
5. Abre un Pull Request

## 📄 Licencia

Propietaria © 2025 Cosmo
