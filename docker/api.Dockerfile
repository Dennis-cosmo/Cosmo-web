FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/connectors/package.json ./packages/connectors/
COPY apps/api/package.json ./apps/api/

RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# Ensure dist directory is clean before starting
RUN rm -rf /app/apps/api/dist

# For development, we'll use the dev script directly
CMD ["yarn", "workspace", "@cosmo/api", "dev"]

# For production builds, we would use:
# RUN yarn workspace @cosmo/api build
# CMD ["yarn", "workspace", "@cosmo/api", "start:prod"] 