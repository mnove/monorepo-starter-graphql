import { execSync } from "child_process";
import { PrismaClient } from "@repo/database";
import { hash } from "bcryptjs";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export class TestDatabase {
  private prisma: PrismaClient;
  private auth: any;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            "postgresql://test:test@localhost:5433/test?schema=public",
        },
      },
    });

    this.auth = betterAuth({
      database: prismaAdapter(this.prisma, {
        provider: "postgresql",
      }),
      secret: "test-secret-key",
      baseURL: "http://localhost:3000",
      emailAndPassword: {
        enabled: true,
      },
      advanced: {
        defaultCookieAttributes: {
          secure: false, // Allow HTTP in test environment
          httpOnly: true,
          sameSite: "lax", // Less restrictive for testing
          partitioned: false, // Disable for test environment
        },
      },
    });
  }

  async setup() {
    try {
      const databaseUrl =
        process.env.DATABASE_URL ||
        "postgresql://test:test@localhost:5433/test?schema=public";
      console.log("process.env.DATABASE_URL", databaseUrl);

      // Run migrations on test database
      execSync("pnpm --filter @repo/database db:deploy", {
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          NODE_ENV: "test",
        },
        stdio: "inherit",
      });
    } catch (error) {
      console.error("Failed to run migrations:", error);
      throw error;
    }
  }

  async createTestUser(
    userData: Partial<{
      email: string;
      name: string;
      password: string;
      emailVerified: boolean;
    }> = {}
  ) {
    const defaultUser = {
      email: "test@example.com",
      name: "Test User",
      password: "password123",
      emailVerified: true,
      ...userData,
    };

    const hashedPassword = await hash(defaultUser.password, 12);

    return await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: defaultUser.email,
        name: defaultUser.name,
        emailVerified: defaultUser.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: {
          create: {
            id: crypto.randomUUID(),
            accountId: crypto.randomUUID(),
            providerId: "credential",
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
      include: {
        accounts: true,
      },
    });
  }

  async createSession(userId: string) {
    const session = await this.prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return session;
  }

  async cleanup() {
    // Clean up all tables in the right order (to handle foreign keys)
    const tableNames = [
      "categories_on_todos",
      "todo",
      "category",
      "session",
      "account",
      "user",
    ];

    for (const tableName of tableNames) {
      await this.prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${tableName}" CASCADE`
      );
    }
  }

  async teardown() {
    await this.prisma.$disconnect();
  }

  getPrisma() {
    return this.prisma;
  }

  getAuth() {
    return this.auth;
  }
}
