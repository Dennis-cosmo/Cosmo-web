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

# Production stage
FROM base AS runner
WORKDIR /app

# Create app user for security (non-root)
RUN addgroup --system --gid 1001 nextjs \
    && adduser --system --uid 1001 --ingroup nextjs nextjs

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV GDPR_ENABLED true
ENV DATA_PROCESSING_REGION EU

# Copiar archivos de configuración raíz
COPY --from=builder --chown=nextjs:nextjs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nextjs /app/yarn.lock ./yarn.lock

# Copiar scripts necesarios para runtime
COPY --from=builder --chown=nextjs:nextjs /app/scripts ./scripts

# Copiar aplicación web compilada (Next.js standalone)
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/package.json ./apps/web/package.json

# Copiar packages compilados necesarios
COPY --from=builder --chown=nextjs:nextjs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nextjs:nextjs /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder --chown=nextjs:nextjs /app/packages/ui/dist ./packages/ui/dist
COPY --from=builder --chown=nextjs:nextjs /app/packages/ui/package.json ./packages/ui/package.json

# Verificar estructura en runner
RUN echo "[RUNNER WEB] Verificando estructura copiada:" && \
    ls -la && \
    echo "Apps Web:" && \
    ls -la apps/web/ && \
    echo "Web .next:" && \
    ls -la apps/web/.next/ && \
    echo "Packages:" && \
    ls -la packages/ && \
    echo "Scripts:" && \
    ls -la scripts/

# Health check script (crear antes de cambiar de usuario)
RUN echo 'const http = require("http"); \
const options = { \
  host: "localhost", \
  port: process.env.PORT || 3000, \
  path: "/api/health", \
  timeout: 2000 \
}; \
const req = http.request(options, (res) => { \
  process.exit(res.statusCode === 200 ? 0 : 1); \
}); \
req.on("error", (err) => { console.error(err); process.exit(1); }); \
req.end();' > /app/healthcheck-web.js && \
    chown nextjs:nextjs /app/healthcheck-web.js

USER nextjs

EXPOSE 3000

ENV PORT 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node /app/healthcheck-web.js

ENTRYPOINT ["dumb-init", "--"]

# Start Next.js server from standalone build
CMD ["node", "apps/web/server.js"] 