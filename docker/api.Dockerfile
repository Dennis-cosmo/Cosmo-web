# Etapa de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiamos primero solo package.json, yarn.lock y babel.config.js desde el monorepo raíz
COPY package.json yarn.lock babel.config.js ./

# Copiamos ahora el resto del código fuente del monorepo (apps, packages, etc)
COPY . .

# Instalamos dependencias completas con workspaces (monorepo)
RUN yarn install --frozen-lockfile

# Ejecutamos el build del workspace de la API
RUN yarn workspace @cosmo/api build

# Etapa de producción
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiamos el build de la API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copiamos el package.json del workspace de API
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Copiamos node_modules completo (instalado en builder)
COPY --from=builder /app/node_modules ./node_modules

# Copiamos también el babel.config.js por si es requerido en runtime (opcional)
COPY --from=builder /app/babel.config.js ./babel.config.js

# Copiamos el package.json raíz por consistencia (opcional)
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

# Comando de arranque
CMD ["yarn", "workspace", "@cosmo/api", "start"]
