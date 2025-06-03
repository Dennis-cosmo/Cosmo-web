FROM node:18-alpine AS base

# Install dependencies for native modules and security
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Build stage
FROM base AS builder
WORKDIR /app # Asegurar que estamos en /app

# Copiar TODO el contexto de build (desde /app del host) a /app en el contenedor
COPY . .

# Verificar que los archivos cruciales están presentes DESPUÉS del COPY .
RUN echo "[BUILD DEBUG API] Contenido de /app después de COPY . .:" && ls -la && \
    echo "[BUILD DEBUG API] Verificando /app/packages/database/package.json..." && \
    if [ -f "packages/database/package.json" ]; then \
        echo "[BUILD DEBUG API] SUCCESS: packages/database/package.json ENCONTRADO. Contenido:"; \
        cat packages/database/package.json; \
        # Verificar el nombre del paquete
        grep -q '"name": "@cosmo/database"' packages/database/package.json || (echo "[BUILD DEBUG API] ERROR: El nombre en packages/database/package.json NO es @cosmo/database" && exit 1); \
        echo "[BUILD DEBUG API] Nombre @cosmo/database verificado en package."; \
    else \
        echo "[BUILD DEBUG API] ERROR: packages/database/package.json NO ENCONTRADO"; \
        exit 1; \
    fi

# Limpiar node_modules por si acaso antes de instalar
RUN echo "[BUILD DEBUG API] Limpiando node_modules existentes..." && \
    rm -rf node_modules && \
    rm -rf apps/*/node_modules && \
    rm -rf packages/*/node_modules

# Instalar todas las dependencias del monorepo
RUN echo "[BUILD DEBUG API] Ejecutando yarn install..." && \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile --check-files --verbose; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Verificar symlinks de workspaces después de yarn install
RUN echo "[BUILD DEBUG API] Contenido de /app/node_modules/@cosmo/ después de yarn install:" && \
    ls -la node_modules/@cosmo/ || echo "[BUILD DEBUG API] Directorio /app/node_modules/@cosmo/ no encontrado o vacío." && \
    echo "[BUILD DEBUG API] Verificando específicamente el enlace para @cosmo/database en /app/node_modules/@cosmo/database:" && \
    ls -ld node_modules/@cosmo/database || echo "[BUILD DEBUG API] Enlace node_modules/@cosmo/database no encontrado."

# Build arguments
ARG NODE_ENV=production
ARG GDPR_ENABLED=true
ENV NODE_ENV=$NODE_ENV
ENV GDPR_ENABLED=$GDPR_ENABLED

# Build dependencies first
RUN echo "[BUILD DEBUG API] Construyendo @cosmo/shared..." && \
    yarn workspace @cosmo/shared build

RUN echo "[BUILD DEBUG API] Construyendo @cosmo/database..." && \
    yarn workspace @cosmo/database build

# Build the application API
RUN echo "[BUILD DEBUG API] Intentando construir @cosmo/api..." && \
    yarn workspace @cosmo/api build

# Production stage
FROM base AS runner
WORKDIR /app

# Create app user for security (non-root)
RUN addgroup --system --gid 1001 nestjs \
    && adduser --system --uid 1001 --ingroup nestjs nestjs

# Set production environment
ENV NODE_ENV production
ENV GDPR_ENABLED true
ENV DATA_PROCESSING_REGION EU

# Copiar solo los artefactos necesarios de la etapa builder
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/package.json ./apps/api/package.json

# Copiar node_modules de producción (solo los necesarios para la API)
# Es mejor copiar selectivamente los node_modules de la app específica o reconstruirlos.
# Para simplificar, copiaremos los node_modules del builder, asumiendo que son los correctos.
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
# Específicamente para la API, si tiene sus propios node_modules directos
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/node_modules ./apps/api/node_modules

COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json # package.json raíz por si es necesario para scripts

# Create necessary directories for GDPR compliance
RUN mkdir -p /app/logs /app/temp /app/exports \
    && chown -R nestjs:nestjs /app/logs /app/temp /app/exports

# Health check script
COPY --chown=nestjs:nestjs <<EOF /app/healthcheck.js
const http = require('http');
const options = {
  host: 'localhost',
  port: process.env.PORT || 4000,
  path: '/health',
  timeout: 2000
};
const req = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});
req.on('error', () => process.exit(1));
req.end();
EOF

USER nestjs

# Expose port
EXPOSE 4000

# Health check for GDPR monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node /app/healthcheck.js

# Use dumb-init to handle signals properly for graceful shutdowns (GDPR requirement)
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["yarn", "workspace", "@cosmo/api", "start:prod"] 