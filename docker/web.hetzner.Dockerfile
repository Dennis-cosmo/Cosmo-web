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
WORKDIR /app # Asegurar que estamos en /app

# Copiar TODO el contexto de build (desde /app del host) a /app en el contenedor
COPY . .

# Verificar que los archivos cruciales están presentes DESPUÉS del COPY .
RUN echo "[BUILD DEBUG WEB] Contenido de /app después de COPY . .:" && ls -la && \
    echo "[BUILD DEBUG WEB] Contenido de /app/apps/web después de COPY . .:" && ls -la apps/web && \
    if [ -f "apps/web/next.config.js" ]; then \
        echo "[BUILD DEBUG WEB] SUCCESS: apps/web/next.config.js ENCONTRADO"; \
    else \
        echo "[BUILD DEBUG WEB] ERROR: apps/web/next.config.js NO ENCONTRADO"; \
        exit 1; \
    fi

# Instalar todas las dependencias del monorepo
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile --check-files; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Build arguments (Next.js usa estos)
ARG NEXT_TELEMETRY_DISABLED=1
ARG GDPR_ENABLED=true
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED
ENV GDPR_ENABLED=$GDPR_ENABLED
ENV NODE_ENV=production

# Build dependencies first
RUN echo "[BUILD DEBUG WEB] Construyendo @cosmo/shared..." && \
    yarn workspace @cosmo/shared build

RUN echo "[BUILD DEBUG WEB] Construyendo @cosmo/ui..." && \
    yarn workspace @cosmo/ui build

# Build the application WEB
RUN echo "[BUILD DEBUG WEB] Intentando construir @cosmo/web..." && \
    yarn workspace @cosmo/web build

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

# Copiar solo los artefactos necesarios de la etapa builder
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/standalone ./apps/web/
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/package.json ./apps/web/package.json # Para que Next.js encuentre el script start
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/static ./apps/web/.next/static

# Copiar node_modules de producción. Next.js standalone output maneja esto de manera diferente.
# El output standalone ya incluye los node_modules necesarios en .next/standalone/<app>/node_modules
# pero es posible que también necesite node_modules en la raíz de la app para ciertos casos.
# Por seguridad, copiamos los node_modules raíz también.
COPY --from=builder --chown=nextjs:nextjs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/node_modules ./apps/web/node_modules

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Health check script
COPY --chown=nextjs:nextjs <<EOF /app/healthcheck-web.js
const http = require('http');
const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health', // Next.js health check, asegúrate que exista
  timeout: 2000
};
const req = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});
req.on('error', (err) => { console.error(err); process.exit(1); });
req.end();
EOF

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node /app/healthcheck-web.js

ENTRYPOINT ["dumb-init", "--"]
# El comando debe estar en apps/web/package.json y ejecutarse desde el dir correcto
# CMD ["node", "apps/web/server.js"]
CMD ["yarn", "workspace", "@cosmo/web", "start"] 