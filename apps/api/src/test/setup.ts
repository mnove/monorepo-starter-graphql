import { beforeAll, afterAll } from "vitest";
import { config } from "dotenv";
import { resolve } from "path";
import { TestDatabase } from "./helpers/test-database";

// Set environment variables FIRST before any other imports
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://test:test@localhost:5433/test?schema=public";
process.env.NODE_ENV = "test";
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || "test-secret-key";
process.env.BASE_SERVER_URL =
  process.env.BASE_SERVER_URL || "http://localhost:5001";

// Load test environment variables
config({ path: resolve(__dirname, "../../.env.test") });

// Test configuration
export const testConfig = {
  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://test:test@localhost:5433/test?schema=public",
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET || "test-secret-key",
    baseURL: process.env.BASE_SERVER_URL || "http://localhost:5001",
  },
  server: {
    port: 0, // Let the system assign a port for tests
  },
};

// Ensure environment variables are set
process.env.DATABASE_URL = testConfig.database.url;
process.env.NODE_ENV = "test";
process.env.BETTER_AUTH_SECRET = testConfig.auth.secret;
process.env.BASE_SERVER_URL = testConfig.auth.baseURL;

// Global test database instance
let globalTestDb: TestDatabase;

beforeAll(async () => {
  console.log("🔧 Setting up test environment...");

  // Initialize test database
  globalTestDb = new TestDatabase();

  try {
    await globalTestDb.setup();
    console.log("✅ Test database setup complete");
  } catch (error) {
    console.error("❌ Failed to setup test database:", error);
    throw error;
  }
}, 60000); // 60 second timeout for setup

afterAll(async () => {
  console.log("🧹 Cleaning up test environment...");

  if (globalTestDb) {
    try {
      await globalTestDb.teardown();
      console.log("✅ Test database cleanup complete");
    } catch (error) {
      console.error("❌ Failed to cleanup test database:", error);
    }
  }
}, 30000); // 30 second timeout for cleanup

// Export for use in tests
export { globalTestDb };
