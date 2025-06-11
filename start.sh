#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting services..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please run setup.sh first."
  echo "Usage: ./setup.sh <domain_name>"
  exit 1
fi

# Load environment variables
source .env

# run pnpm script
pnpm run docker:prod

echo ">> Services started"
echo ">> To stop services, run: pnpm run docker:prod:down"