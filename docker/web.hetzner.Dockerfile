FROM node:18-alpine AS base

# Install dependencies for native modules and security
RUN apk add --no-cache \
    dumb-init \
    git \
    python3 \
    make \
    g++ \
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
RUN echo "[BUILD DEBUG WEB] Estructura después de COPY:" && \
    ls -la && \
    echo "Apps:" && \
    ls -la apps/ && \
    echo "Packages:" && \
    ls -la packages/ && \
    echo "Scripts:" && \
    ls -la scripts/ && \
    echo "Web específico:" && \
    ls -la apps/web/

# Limpiar cualquier node_modules existente
RUN rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Build arguments (Next.js usa estos)
ARG NEXT_TELEMETRY_DISABLED=1
ARG GDPR_ENABLED=true
ARG NODE_ENV=production
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG QUICKBOOKS_CLIENT_ID
ARG QUICKBOOKS_CLIENT_SECRET
ARG QUICKBOOKS_REDIRECT_URI

# Exportar como variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED
ENV GDPR_ENABLED=$GDPR_ENABLED
ENV NODE_ENV=$NODE_ENV
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV QUICKBOOKS_CLIENT_ID=$QUICKBOOKS_CLIENT_ID
ENV QUICKBOOKS_CLIENT_SECRET=$QUICKBOOKS_CLIENT_SECRET
ENV QUICKBOOKS_REDIRECT_URI=$QUICKBOOKS_REDIRECT_URI

# Build packages en orden correcto
RUN echo "[BUILD WEB] Building @cosmo/shared..." && \
    yarn workspace @cosmo/shared build

RUN echo "[BUILD WEB] Building @cosmo/ui..." && \
    yarn workspace @cosmo/ui build

RUN echo "[BUILD WEB] Building @cosmo/web..." && \
    yarn workspace @cosmo/web build

# Verificar que todo se construyó correctamente
RUN echo "[BUILD WEB] Verificando builds:" && \
    ls -la packages/shared/dist/ && \
    ls -la packages/ui/dist/ && \
    ls -la apps/web/.next/ && \
    echo "[BUILD WEB] Verificando standalone:" && \
    ls -la apps/web/.next/standalone/ && \
    echo "[BUILD WEB] Contenido completo standalone:" && \
    find apps/web/.next/standalone -name "*.js" | head -10

# Verificación final antes de empaquetar en imagen de producción
RUN echo "[BUILD WEB] Verificando builds:" && \
    ls -la packages/shared/dist/ && \
    ls -la packages/ui/dist/ && \
    ls -la apps/web/.next/ 

# Etapa final - Imagen de producción
FROM base AS runner
WORKDIR /app

# Crear usuario para correr la app (seguridad)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

# Configuración de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar las dependencias y archivos del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copiar la app Next.js compilada
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static /app/apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public /app/apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/BUILD_ID /app/apps/web/.next/BUILD_ID
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/routes-manifest.json /app/apps/web/.next/routes-manifest.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/required-server-files.json /app/apps/web/.next/required-server-files.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/server /app/apps/web/.next/server
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/app-build-manifest.json /app/apps/web/.next/app-build-manifest.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/build-manifest.json /app/apps/web/.next/build-manifest.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/prerender-manifest.json /app/apps/web/.next/prerender-manifest.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.js /app/apps/web/

# Permisos de directorio para nextjs
RUN chown -R nextjs:nodejs /app

# Usuarios de producción para seguridad
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check para monitoreo GDPR
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Iniciar aplicación
ENV PORT 3000
WORKDIR /app/apps/web
CMD ["node", "node_modules/.bin/next", "start"] 