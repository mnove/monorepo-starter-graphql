# API Integration Testing Suite

This directory contains a comprehensive integration testing suite for the GraphQL API with Better Auth authentication and Prisma database integration.

## Overview

The testing suite provides:

- **Real Database Testing**: Uses a dedicated PostgreSQL test database via Docker
- **Authentication Testing**: Full Better Auth session-based authentication flow
- **GraphQL Integration**: Complete GraphQL query/mutation testing
- **User Isolation**: Tests ensure proper data isolation between users
- **End-to-End Scenarios**: Complete user journey testing

## Setup

### Prerequisites

1. **Docker & Docker Compose**: Required for test database
2. **pnpm**: Package manager
3. **Node.js 18+**: Runtime environment

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Start the test database:

```bash
pnpm test:setup
```

3. Run the tests:

```bash
pnpm test
```

### Available Scripts

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Setup test database only
pnpm test:setup

# Cleanup test database
pnpm test:cleanup

# Full test cycle (setup + test + cleanup)
pnpm test:full
```

### From Root Directory

```bash
# Run API tests from monorepo root
pnpm test:api

# Run API tests in watch mode from monorepo root
pnpm test:api:watch
```

## Test Structure

### Core Components

- **`helpers/test-database.ts`**: Database setup, cleanup, and user management
- **`helpers/test-server.ts`**: Test server creation with authentication
- **`helpers/auth-helper.ts`**: Authentication utilities for testing
- **`helpers/graphql-client.ts`**: GraphQL testing client with auth support
- **`helpers/test-data-factory.ts`**: Test data creation utilities
- **`helpers/graphql-queries.ts`**: Reusable GraphQL queries and mutations

### Test Suites

- **`auth.test.ts`**: Authentication and session management tests
- **`todo.test.ts`**: Todo CRUD operations and user isolation tests
- **`category.test.ts`**: Category management and relationship tests
- **`integration.test.ts`**: End-to-end user journey and multi-user scenarios

## Test Database

The test suite uses a dedicated PostgreSQL database running in Docker:

- **Host**: localhost
- **Port**: 5433 (different from dev database)
- **Database**: test_db
- **User**: test_user
- **Password**: test_password

### Configuration

Environment variables for testing are set in `.env.test`:

```env
TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5433/test_db?schema=public
BETTER_AUTH_SECRET=test-secret-key-for-integration-tests
NODE_ENV=test
```

## Testing Patterns

### Basic Test Structure

```typescript
describe("Feature Tests", () => {
  let testDb: TestDatabase;
  let server: FastifyInstance;
  let client: GraphQLTestClient;
  let authHelper: AuthTestHelper;

  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.setup();

    const serverSetup = createTestServer(testDb.getPrisma());
    server = serverSetup.app;
    await server.ready();

    client = new GraphQLTestClient(server);
    authHelper = new AuthTestHelper(server, serverSetup.auth, testDb);
  });

  afterAll(async () => {
    await server.close();
    await testDb.teardown();
  });

  beforeEach(async () => {
    await testDb.cleanup(); // Clean between tests
  });

  it("should test something", async () => {
    // Test implementation
  });
});
```

### Authentication Testing

```typescript
// Create authenticated user
const { sessionCookie, user } = await authHelper.createAuthenticatedUser({
  email: "test@example.com",
  name: "Test User",
});

// Make authenticated GraphQL request
client.setAuth(sessionCookie);
const result = await client.query(SOME_QUERY);

// Or use one-off authenticated request
const result = await client.authenticatedQuery(
  SOME_QUERY,
  sessionCookie,
  variables
);
```

### GraphQL Testing

```typescript
// Query execution
const result = await client.query(GET_TODOS);

// Check for errors
expect(client.hasErrors(result)).toBe(false);

// Get response data
const data = client.getData(result);
expect(data.todos).toHaveLength(3);

// Mutation execution
const result = await client.mutate(CREATE_TODO, {
  input: { title: "New Todo", content: "Todo content" },
});
```

### Test Data Creation

```typescript
const dataFactory = new TestDataFactory(testDb.getPrisma());

// Create test todo
const todo = await dataFactory.createTodo(userId, {
  title: "Test Todo",
  completed: false,
});

// Create multiple todos
const todos = await dataFactory.createMultipleTodos(userId, 5);

// Create todo with categories
const todo = await dataFactory.createTodoWithCategories(
  userId,
  { title: "Categorized Todo" },
  ["Work", "Urgent"]
);
```

## Test Categories

### Unit-Level Integration Tests

- Authentication flows (sign up, sign in, sign out)
- Individual GraphQL resolvers
- Data validation and error handling

### Feature-Level Integration Tests

- Complete CRUD operations for todos and categories
- User isolation and data privacy
- Authorization checks

### End-to-End Integration Tests

- Complete user journeys from registration to task management
- Multi-user collaboration scenarios
- Complex data relationship testing

## Best Practices

### Database Management

- Each test gets a clean database state via `beforeEach` cleanup
- Use transactions where possible for faster test execution
- Proper cleanup in `afterAll` hooks

### Authentication

- Create fresh users for each test to avoid side effects
- Test both authenticated and unauthenticated scenarios
- Verify proper session management

### GraphQL Testing

- Test both successful operations and error cases
- Verify proper error messages and status codes
- Test field-level permissions and data filtering

### Assertions

- Use descriptive test names and assertions
- Test edge cases and boundary conditions
- Verify both positive and negative scenarios

## Debugging

### View Test Database

Connect to the test database during debugging:

```bash
psql postgresql://test_user:test_password@localhost:5433/test_db
```

### Debug Individual Tests

Run specific test files:

```bash
npx vitest run src/tests/auth.test.ts
```

### Enable Debug Logs

Set environment variables for verbose logging:

```bash
NODE_ENV=test DEBUG=* pnpm test
```

## CI/CD Integration

The test suite is designed to work in CI environments:

1. **Docker Requirement**: Ensure Docker is available in CI
2. **Database Setup**: Tests handle database setup/teardown automatically
3. **Parallel Execution**: Tests run sequentially to avoid database conflicts
4. **Clean Exit**: Proper cleanup ensures no hanging processes

### GitHub Actions Example

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test:api
```

## Troubleshooting

### Database Connection Issues

- Ensure Docker is running
- Check if port 5433 is available
- Verify test database is started: `docker ps`

### Test Timeouts

- Increase timeout in `vitest.config.ts` if needed
- Check for hanging database connections
- Ensure proper cleanup in test hooks

### Authentication Failures

- Verify Better Auth configuration in test environment
- Check session cookie extraction logic
- Ensure test users are created properly

### GraphQL Schema Issues

- Verify schema is properly built
- Check for resolver implementation
- Ensure proper type definitions

## Contributing

When adding new tests:

1. Follow existing patterns and structure
2. Add proper setup/cleanup in test hooks
3. Test both success and failure scenarios
4. Update this README if adding new utilities
5. Ensure tests are deterministic and isolated
