# Etapa de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiamos primero los archivos de config al root
COPY package.json yarn.lock babel.config.js ./

# Copiamos el resto del código fuente del monorepo (apps, packages, etc)
COPY . .

# Instalamos todas las dependencias con workspaces habilitados
RUN yarn install --frozen-lockfile

# Ejecutamos el build de la API desde el root
RUN yarn workspace @cosmo/api run build

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

EXPOSE 4000

CMD ["yarn", "workspace", "@cosmo/api", "start"]
