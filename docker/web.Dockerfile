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

# Build for production
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN yarn workspace @cosmo/web build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "workspace", "@cosmo/web", "start"] 