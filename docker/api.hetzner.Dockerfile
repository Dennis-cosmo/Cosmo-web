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
WORKDIR /app

# Copiar archivos de configuración primero
COPY package.json yarn.lock turbo.json tsconfig.json ./

# Copiar directorios de workspace
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY scripts/ ./scripts/

# Verificar estructura después de copiar
RUN echo "[BUILD DEBUG] Estructura después de COPY:" && \
    ls -la && \
    echo "Apps:" && \
    ls -la apps/ && \
    echo "Packages:" && \
    ls -la packages/ && \
    echo "Scripts:" && \
    ls -la scripts/

# Limpiar cualquier node_modules existente
RUN rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Build arguments
ARG NODE_ENV=production
ARG GDPR_ENABLED=true
ENV NODE_ENV=$NODE_ENV
ENV GDPR_ENABLED=$GDPR_ENABLED

# Build packages en orden correcto
RUN echo "[BUILD] Building @cosmo/shared..." && \
    yarn workspace @cosmo/shared build

RUN echo "[BUILD] Building @cosmo/database..." && \
    yarn workspace @cosmo/database build

# Build API con verificaciones detalladas
RUN echo "[BUILD] Building @cosmo/api..." && \
    cd apps/api && \
    echo "Current API directory:" && \
    pwd && \
    echo "API directory contents before build:" && \
    ls -la && \
    echo "API tsconfig.json contents:" && \
    cat tsconfig.json && \
    cd /app && \
    yarn workspace @cosmo/api build && \
    echo "[BUILD] Verificando que el dist se creó..." && \
    ls -la apps/api/ && \
    if [ ! -d "apps/api/dist" ]; then \
        echo "[ERROR] apps/api/dist no se creó! Intentando build directo..." && \
        cd apps/api && \
        npx nest build && \
        cd /app; \
    fi && \
    echo "[BUILD] Estado final de apps/api/dist:" && \
    ls -la apps/api/dist/

# Verificar que todo se construyó correctamente
RUN echo "[BUILD] Verificando builds finales:" && \
    ls -la packages/shared/dist/ && \
    ls -la packages/database/dist/ && \
    ls -la apps/api/dist/

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

# Copiar archivos de configuración raíz
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nestjs /app/yarn.lock ./yarn.lock
COPY --from=builder --chown=nestjs:nestjs /app/turbo.json ./turbo.json
COPY --from=builder --chown=nestjs:nestjs /app/tsconfig.json ./tsconfig.json

# Copiar scripts necesarios para runtime
COPY --from=builder --chown=nestjs:nestjs /app/scripts ./scripts

# Copiar node_modules del workspace
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules

# Copiar API compilada y sus archivos
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/package.json ./apps/api/package.json

# Copiar packages compilados
COPY --from=builder --chown=nestjs:nestjs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nestjs:nestjs /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder --chown=nestjs:nestjs /app/packages/database/dist ./packages/database/dist
COPY --from=builder --chown=nestjs:nestjs /app/packages/database/package.json ./packages/database/package.json

# Verificar estructura en runner
RUN echo "[RUNNER] Verificando estructura copiada:" && \
    ls -la && \
    echo "Apps API:" && \
    ls -la apps/api/ && \
    echo "Packages:" && \
    ls -la packages/ && \
    echo "Scripts:" && \
    ls -la scripts/ && \
    echo "API dist:" && \
    ls -la apps/api/dist/

# Create necessary directories for GDPR compliance
RUN mkdir -p /app/logs /app/temp /app/exports \
    && chown -R nestjs:nestjs /app/logs /app/temp /app/exports

# Health check script
RUN echo 'const http = require("http"); \
const options = { \
  host: "localhost", \
  port: process.env.PORT || 4000, \
  path: "/health", \
  timeout: 2000 \
}; \
const req = http.request(options, (res) => { \
  process.exit(res.statusCode === 200 ? 0 : 1); \
}); \
req.on("error", () => process.exit(1)); \
req.end();' > /app/healthcheck.js && \
    chown nestjs:nestjs /app/healthcheck.js

USER nestjs

# Expose port
EXPOSE 4000

# Health check for GDPR monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node /app/healthcheck.js

# Use dumb-init to handle signals properly for graceful shutdowns (GDPR requirement)
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "apps/api/dist/main.js"] 