import { FastifyInstance } from "fastify";
import { TestDatabase } from "./test-database";

// Define a simple cookie interface to avoid the light-my-request type issue
interface SimpleCookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  expires?: Date;
  maxAge?: number;
}

export class AuthTestHelper {
  constructor(
    private app: FastifyInstance,
    private auth: any,
    private testDb: TestDatabase
  ) {}
  

  async signUp(
    userData: Partial<{
      email: string;
      password: string;
      name: string;
    }> = {}
  ): Promise<{
    data: any;
    cookies: SimpleCookie[];
    headers: any;
    statusCode: number;
  }> {
    const defaultData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      ...userData,
    };

    const response = await this.app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: defaultData,
      headers: {
        "content-type": "application/json",
      },
    });

    console.log("Sign Up Response:", response.body);

    return {
      data: JSON.parse(response.body),
      cookies: response.cookies as SimpleCookie[],
      headers: response.headers,
      statusCode: response.statusCode,
    };
  }

  async signIn(
    credentials: Partial<{
      email: string;
      password: string;
    }> = {}
  ): Promise<{
    data: any;
    cookies: SimpleCookie[];
    headers: any;
    statusCode: number;
  }> {
    const defaultCredentials = {
      email: "test@example.com",
      password: "password123",
      ...credentials,
    };

    const response = await this.app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: defaultCredentials,
      headers: {
        "content-type": "application/json",
      },
    });

    return {
      data: JSON.parse(response.body),
      cookies: response.cookies as SimpleCookie[],
      headers: response.headers,
      statusCode: response.statusCode,
    };
  }

  async createAuthenticatedUser(
    userData: Partial<{
      email: string;
      name: string;
      password: string;
      emailVerified: boolean;
    }> = {}
  ) {
    // Create user in database
    const user = await this.testDb.createTestUser(userData);

    // Create session
    const session = await this.testDb.createSession(user.id);

    // Return session cookie for requests
    return {
      user,
      session,
      sessionCookie: `better-auth.session_token=${session.token}; Path=/; HttpOnly`,
    };
  }

  extractSessionCookie(cookies: SimpleCookie[]): string {
    console.log("Extracting session cookie from:", cookies);
    if (!cookies || cookies.length === 0) return "";

    const sessionCookie = cookies.find(
      (cookie) =>
        cookie.name === "better-auth.session_token" ||
        cookie.name.includes("session")
    );

    return sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : "";
  }

  async signOut(): Promise<{
    data: any;
    cookies: SimpleCookie[];
    statusCode: number;
  }> {
    const response = await this.app.inject({
      method: "POST",
      url: "/api/auth/sign-out",
      headers: {
        "content-type": "application/json",
      },
    });

    return {
      data: response.body ? JSON.parse(response.body) : null,
      cookies: response.cookies as SimpleCookie[],
      statusCode: response.statusCode,
    };
  }
}
