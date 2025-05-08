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

# Instalar argon2 y bcryptjs con las dependencias necesarias 
RUN yarn workspace @cosmo/api add argon2 bcryptjs dotenv 

# Copiar código fuente
COPY . .

# Limpiar directorio de compilación
RUN rm -rf /app/apps/api/dist

# Para desarrollo, usamos el script de dev directamente
CMD ["yarn", "workspace", "@cosmo/api", "dev"]

# Para producción, usaríamos:
# RUN yarn workspace @cosmo/api build
# CMD ["yarn", "workspace", "@cosmo/api", "start:prod"] 