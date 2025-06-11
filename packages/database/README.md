## Database

This package provides a centralized Prisma client and database configuration for the application. It includes type-safe database operations, connection management, and migration utilities.

## Structure

- **Prisma Client** is configured with global instance management for development hot-reloading
- **Generated Types** from Prisma schema are re-exported for type-safe database operations
- **Connection Handling** includes automatic connection with error handling and graceful shutdown
- **Migration Scripts** for database schema management and deployment

## Features

- **Global Instance Management** - Prevents multiple Prisma client instances in development
- **Type Safety** - Full TypeScript support with generated Prisma types
- **Hot Reload Support** - Development-friendly client reuse across rebuilds

## Development

### Scripts

- `npm run build` - Generate Prisma client and build TypeScript package
- `npm run type-check` - Type check TypeScript without emitting
- `npm run db:generate` - Generate Prisma client from schema
- `npm run db:migrate` - Create and apply new migration in development
- `npm run db:deploy` - Deploy migrations to production database

### Database Migrations

```bash
# Create a new migration
pnpm db:migrate

# Deploy migrations to production
pnpm db:deploy

# Regenerate Prisma client after schema changes
pnpm db:generate
```

### Environment Setup

Ensure your `.env` file contains the database connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database"
```

## Connection Management

The package automatically handles database connections:

- **Development**: Uses global instance to prevent connection limit issues during hot reloading
- **Production**: Creates new client instance for each import
- **Error Handling**: Logs connection errors and exits process on failure
- **Graceful Shutdown**: Properly disconnects when application terminates

## Build Process

The build process includes:

1. **Prisma Generation** - Generates client and types from schema
2. **TypeScript Compilation** - Builds both CommonJS and ESM formats
3. **Type Declaration** - Generates TypeScript declaration files

## Notes

- The package re-exports all Prisma client types for convenient importing
- Global client instance is only used in non-production environments
- Connection errors will cause the application to exit to prevent silent failures
- Generated Prisma client must be regenerated after schema changes
