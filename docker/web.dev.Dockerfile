FROM node:18-alpine

WORKDIR /app

# Instalar dependencias de compilación
RUN apk add --no-cache python3 make g++ git

# Copiar archivos de configuración
COPY package.json yarn.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/database/package.json ./packages/database/
COPY packages/connectors/package.json ./packages/connectors/
COPY apps/web/package.json ./apps/web/

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar código fuente
COPY . .

# Set development environment
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3000

# Start in development mode with hot reload
CMD ["yarn", "workspace", "@cosmo/web", "dev"] 