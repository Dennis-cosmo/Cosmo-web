# Cosmo - Plataforma de Finanzas Sostenibles

Cosmo es una plataforma SaaS B2B que automatiza el seguimiento de gastos y sostenibilidad, proporcionando a las empresas las herramientas necesarias para cumplir con normativas europeas de ESG (Environmental, Social, Governance).

## Características principales

- **Seguimiento automatizado de gastos con enfoque en sostenibilidad**
- **Clasificación inteligente de transacciones verdes/no verdes mediante IA**
- **Integración con sistemas ERP (SAP, QuickBooks, etc.)**
- **Reportes automáticos conformes a normativas europeas**
- **Análisis de huella de carbono y puntuación de sostenibilidad**

## Estructura del Proyecto

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

## Requisitos previos

- Node.js 18+
- Yarn
- Docker y Docker Compose

## Instalación y desarrollo

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/cosmo.git
   cd cosmo
   ```

2. Instalar dependencias:
   ```bash
   yarn install
   ```

3. Iniciar entorno de desarrollo:
   ```bash
   docker-compose up -d
   ```

4. Iniciar el desarrollo:
   ```bash
   yarn dev
   ```

5. La aplicación estará disponible en:
   - Frontend: http://localhost:3000
   - API: http://localhost:4000/api
   - Documentación API: http://localhost:4000/api/docs

## Tecnologías principales

- **Frontend**: Next.js, React Query, TailwindCSS
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Infraestructura**: Docker, GitHub Actions

## Roadmap

1. **Fase 1: Fundamentos** (4 semanas)
   - Configuración de infraestructura
   - Autenticación y estructuras básicas

2. **Fase 2: Core del MVP** (6 semanas)
   - Gestión manual de gastos
   - Dashboard básico
   - Clasificación básica de sostenibilidad

3. **Fase 3: Integraciones y Reportes** (6 semanas)
   - Primer conector ERP (QuickBooks)
   - Reportes básicos de sostenibilidad
   - Mejoras de UI/UX

4. **Fase 4: Preparación para lanzamiento** (4 semanas)
   - Testing y validación
   - Documentación
   - Infraestructura final

## Licencia

Propietaria © 2023 Cosmo 