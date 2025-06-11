# Etapa 1: Build
FROM node:18 AS builder

WORKDIR /app

# Copiamos los archivos de configuración y dependencias de todo el monorepo
COPY package.json yarn.lock turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

# Instalamos dependencias solo de producción
RUN yarn install --frozen-lockfile

# Build específico de api
RUN yarn workspace @cosmo/api build

# Etapa 2: Producción
FROM node:18 AS production

WORKDIR /app

# Copiamos solo los outputs necesarios (puedes afinar esto para hacerlo aún más minimal)
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["node", "dist/main"]
