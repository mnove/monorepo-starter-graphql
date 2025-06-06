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
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true, // Run tests sequentially to avoid DB conflicts
      },
    },
    // Only include test files
    include: ["src/test/**/*.test.ts", "src/test/**/*.spec.ts"],
    // Exclude other files
    exclude: [
      "node_modules",
      "dist",
      "src/test/helpers/**",
      "src/test/setup.ts",
      "src/test/category.test.ts",
      "src/test/integration.test.ts",
      "src/test/todo.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
