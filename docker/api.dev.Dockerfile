FROM node:18-alpine

WORKDIR /app

# Instalar dependencias de compilación para módulos nativos (argon2)
RUN apk add --no-cache python3 make g++ git

# Copiar archivos de configuración
COPY package.json yarn.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/connectors/package.json ./packages/connectors/
COPY apps/api/package.json ./apps/api/

# Instalar dependencias y ts-node
RUN yarn install --frozen-lockfile && \
    yarn global add ts-node typescript @types/node

# Instalar dependencias específicas
RUN yarn workspace @cosmo/api add argon2 bcryptjs dotenv

# Copiar código fuente
COPY . .

# Reinstalar específicamente openai con la versión correcta
RUN cd /app/apps/api && npm uninstall openai && npm install openai@3.3.0 --save

# Set development environment
ENV NODE_ENV=development

# Expose port
EXPOSE 4000

# Start in development mode with ts-node
CMD ["yarn", "workspace", "@cosmo/api", "dev"] 