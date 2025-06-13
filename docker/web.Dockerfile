FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos el package.json raíz y el lockfile
COPY package.json yarn.lock ./

# Copiamos todo el código fuente del monorepo (para que detecte todos los workspaces)
COPY . .

# Instalamos todas las dependencias de los workspaces
RUN yarn install --frozen-lockfile

# Build específico de la app web
RUN yarn workspace @cosmo/web build

# Etapa de producción
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiamos el build generado de web
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Comando de arranque
CMD ["yarn", "workspace", "@cosmo/web", "start"]
