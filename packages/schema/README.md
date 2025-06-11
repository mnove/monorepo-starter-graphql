## Schema

This package provides a set of reusable GraphQL schemas for the application.
It includes schemas for common data types.

## Structure

- The schemas are defined using GraphQL SDL (Schema Definition Language) as `.ts` files.
- The schemas are merged into a single schema using `@graphql-tools/merge`.
- The package also exports the generated GraphQL types and context for use in resolvers (via `codegen`). This allows for full type-safe resolvers (context included!) and better integration with TypeScript.
- Custom scalars are defined in the `scalars` directory, which can be used to extend the GraphQL schema with custom data types.

## Notes

- Codegen must be run before building the package to ensure that the generated types are up-to-date.
