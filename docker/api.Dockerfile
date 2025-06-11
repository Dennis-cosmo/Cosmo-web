FROM node:18-alpine AS builder

WORKDIR /app

# Copiamos los package.json raíz y el lockfile
COPY package.json yarn.lock ./

# Copiamos todo el código fuente del monorepo
COPY . .

# Instalamos dependencias completas con los workspaces disponibles
RUN yarn install --frozen-lockfile

# Build específico de la API
RUN yarn workspace @cosmo/api build

# Etapa de producción
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiamos solo el build de la API, node_modules y package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

# Comando de arranque
CMD ["yarn", "workspace", "@cosmo/api", "start"]
