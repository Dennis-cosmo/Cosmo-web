FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package.json yarn.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/connectors/package.json ./packages/connectors/
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile

# Instalar bcrypt explícitamente en el workspace de API
RUN yarn workspace @cosmo/api add bcrypt @types/bcrypt

# Copy source
COPY . .

# Ensure dist directory is clean before starting
RUN rm -rf /app/apps/api/dist

# For development, we'll use the dev script directly
CMD ["yarn", "workspace", "@cosmo/api", "dev"]

# For production builds, we would use:
# RUN yarn workspace @cosmo/api build
# CMD ["yarn", "workspace", "@cosmo/api", "start:prod"] 