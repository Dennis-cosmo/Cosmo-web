FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/database/package.json ./packages/database/
COPY packages/connectors/package.json ./packages/connectors/
COPY apps/web/package.json ./apps/web/

RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# For development, we'll use the dev script directly
CMD ["yarn", "workspace", "@cosmo/web", "dev"]

# For production builds, we would use:
# RUN yarn workspace @cosmo/web build
# CMD ["yarn", "workspace", "@cosmo/web", "start"] 