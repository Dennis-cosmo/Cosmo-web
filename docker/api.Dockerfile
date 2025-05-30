FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias de compilación para módulos nativos (argon2)
RUN apk add --no-cache python3 make g++ git

# Copiar archivos de configuración
COPY package.json yarn.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/connectors/package.json ./packages/connectors/
COPY apps/api/package.json ./apps/api/

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Instalar dependencias específicas
RUN yarn workspace @cosmo/api add argon2 bcryptjs dotenv

# Copiar código fuente
COPY . .

# Reinstalar específicamente openai con la versión correcta
RUN cd /app/apps/api && npm uninstall openai && npm install openai@3.3.0 --save

# Build for production
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN yarn workspace @cosmo/api build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Instalar dependencias de runtime
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

# Copy built application and dependencies
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 4000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["yarn", "workspace", "@cosmo/api", "start:prod"] 