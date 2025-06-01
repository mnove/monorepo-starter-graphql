# Build Stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# Copy root workspace configuration files needed for installing dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files for workspace packages to ensure correct dependency installation
COPY apps/api/package.json ./apps/api/
COPY packages/logger/package.json ./packages/logger/
COPY packages/config-typescript/package.json ./packages/config-typescript/
COPY packages/jest-presets/package.json ./packages/jest-presets/
COPY packages/config-eslint/package.json ./packages/config-eslint/
COPY packages/validation-schema/package.json ./packages/validation-schema/
COPY packages/emails/package.json ./packages/emails/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the source code for the API and required workspaces
COPY apps/api/ ./apps/api/
COPY packages/logger/ ./packages/logger/
COPY packages/config-typescript/ ./packages/config-typescript/
COPY packages/jest-presets/ ./packages/jest-presets/
COPY packages/config-eslint/ ./packages/config-eslint/
COPY packages/validation-schema/ ./packages/validation-schema/
COPY packages/emails/ ./packages/emails/

# Generate Prisma client
RUN cd apps/api && pnpm generate

# Build the app and its dependencies
RUN pnpm --filter api... build

# Production Stage
FROM node:22-alpine AS runner

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Install only the necessary production dependencies
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# Copy package.json files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/logger/package.json ./packages/logger/
COPY --from=builder /app/packages/validation-schema/package.json ./packages/validation-schema/
COPY --from=builder /app/packages/config-typescript/package.json ./packages/config-typescript/
COPY --from=builder /app/packages/emails/package.json ./packages/emails/

# Install production dependencies only and clean up in single layer
RUN pnpm install --frozen-lockfile --prod && \
    pnpm store prune && \
    rm -rf ~/.pnpm-store && \
    rm -rf /tmp/* && \
    rm -rf /var/cache/apk/*

# Copy built application from builder stage
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/
COPY --from=builder /app/packages/logger/dist/ ./packages/logger/dist/
COPY --from=builder /app/packages/validation-schema/dist/ ./packages/validation-schema/dist/

# Copy emails package built files (both TypeScript dist and Maizzle build_production)
COPY --from=builder /app/packages/emails/dist/ ./packages/emails/dist/
COPY --from=builder /app/packages/emails/build_production/ ./packages/emails/build_production/

# Copy Prisma schema and migrations for production database migrations
COPY --from=builder /app/apps/api/prisma/ ./apps/api/prisma/
COPY --from=builder /app/apps/api/src/generated/ ./apps/api/generated/

# Copy the startup script and make it executable
COPY --from=builder /app/apps/api/start.sh ./apps/api/start.sh
RUN chmod +x ./apps/api/start.sh

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

# Set working directory to apps/api
WORKDIR /app/apps/api

# Expose the API port
EXPOSE 5001

# Use the script as the container's entry point
ENTRYPOINT ["./start.sh"]
