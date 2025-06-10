import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5433/test?schema=public",
      NODE_ENV: "test",
      BETTER_AUTH_SECRET: "test-secret-key",
      BASE_SERVER_URL: "http://localhost:5001",
    },
    setupFiles: ["./src/tests/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true, // Run tests sequentially to avoid DB conflicts
      },
    },
    // coverage: {
    //   reporter: ["text", "json", "html"],
    // },
    // Only include test files
    include: ["src/tests/**/*.test.ts", "src/tests/**/*.spec.ts"],
    // Exclude other files
    exclude: [
      "node_modules",
      "dist",
      "src/tests/helpers/**",
      "src/tests/setup.ts",
      // "src/tests/category.test.ts",
      // "src/tests/integration.test.ts",
      // "src/tests/todo.test.ts",
      // "src/tests/auth.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
