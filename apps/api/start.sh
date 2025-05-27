#!/bin/sh
# This script runs Prisma migrations and then starts the API
# It should be used as the entrypoint for the Docker container

# Run database migrations
#! Currently commented out to avoid running migrations on every start
#! performed instead in a dedicated migration service
# This directly uses the Prisma binary that was installed as part of dependencies, ensuring exact version specified in your package.json
# echo "Running database migrations..."
# ./node_modules/.bin/prisma migrate deploy

# Start the application
echo "Starting API server..."
exec node dist/index.js
