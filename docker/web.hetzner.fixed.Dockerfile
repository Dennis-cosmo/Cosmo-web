FROM node:18-alpine AS base

# Instalar dependencias para compilación
RUN apk add --no-cache \
    dumb-init \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Etapa de construcción
FROM base AS builder
WORKDIR /app

# Copiar archivos de configuración
COPY package.json yarn.lock turbo.json tsconfig.json ./

# Copiar código fuente
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY scripts/ ./scripts/

# Limpiar instalaciones previas
RUN rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Compilar paquetes compartidos
RUN echo "[BUILD] Building @cosmo/shared..." && \
    yarn workspace @cosmo/shared build

RUN echo "[BUILD] Building @cosmo/ui..." && \
    yarn workspace @cosmo/ui build

# Compilar aplicación web (Next.js)
RUN echo "[BUILD] Building @cosmo/web..." && \
    yarn workspace @cosmo/web build

# Verificación final
RUN echo "[BUILD] Verificando build:" && \
    ls -la apps/web/.next/

# Etapa de producción
FROM base AS runner
WORKDIR /app

# Crear usuario para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

# Configuración de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar dependencias y packages compilados
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/ui/dist ./packages/ui/dist
COPY --from=builder /app/packages/ui/package.json ./packages/ui/package.json

# Copiar aplicación Next.js compilada
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/next.config.js ./apps/web/next.config.js
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next

# Permisos para el usuario nextjs
RUN chown -R nextjs:nodejs /app

# Configuración de producción
USER nextjs
EXPOSE 3000
ENV PORT=3000
WORKDIR /app/apps/web

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Comando de inicio
CMD ["node_modules/.bin/next", "start"] 