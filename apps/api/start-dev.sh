#!/bin/sh
# Development startup script for API
# Runs database migrations, regenerates Prisma client for Linux platform and starts the API in watch mode

echo "Running database migrations..."
cd /app/packages/database && pnpm run db:deploy

echo "Regenerating Prisma client for Linux platform..."
cd /app/packages/database && pnpm run db:generate

echo "Starting API in development mode..."
cd /app/apps/api
exec pnpm dev:docker
