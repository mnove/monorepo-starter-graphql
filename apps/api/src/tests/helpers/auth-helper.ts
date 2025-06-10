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

    // console.log("Sign Up Response:", response.body);

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

    // console.log("Sign In Response:", response.cookies);

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
    // Use the provided userData, but fall back to defaults
    const userToCreate = {
      email: userData.email || "test@example.com",
      password: userData.password || "testPassword123",
      name: userData.name || "Test User",
    };

    // Sign up the user
    const signUpResult = await this.signUp(userToCreate);

    if (signUpResult.statusCode !== 200) {
      throw new Error(
        `Failed to sign up user: ${JSON.stringify(signUpResult.data)}`
      );
    }

    // Sign in to get a session
    const signInResult = await this.signIn({
      email: userToCreate.email,
      password: userToCreate.password,
    });

    if (signInResult.statusCode !== 200) {
      throw new Error(
        `Failed to sign in user: ${JSON.stringify(signInResult.data)}`
      );
    }

    // console.log("createAuthenticatedUser - signInResult:", signInResult);

    // Extract session cookie
    const sessionCookie = this.extractSessionCookie(signInResult.cookies);

    // Return all the necessary data
    return {
      user: signInResult.data.user,
      cookies: signInResult.cookies,
      sessionCookie,
    };
  }

  extractSessionCookie(cookies: SimpleCookie[]): string {
    // console.log("Extracting session cookie from:", cookies);
    if (!cookies || cookies.length === 0) return "";

    const sessionCookie = cookies.find(
      (cookie) =>
        cookie.name === "better-auth.session_token" ||
        cookie.name.includes("session")
    );

    if (sessionCookie) {
      // Format the cookie properly for headers
      const cookieValue = `${sessionCookie.name}=${sessionCookie.value}`;
      console.log("Extracted session cookie:", cookieValue);
      return cookieValue;
    }

    console.log("No session cookie found");
    return "";
  }

  async signOut(sessionCookie?: string): Promise<{
    data: any;
    cookies: SimpleCookie[];
    statusCode: number;
    headers: any;
  }> {
    const headers: any = {
      "content-type": "application/json",
    };

    if (sessionCookie) {
      headers.cookie = sessionCookie;
    }

    const response = await this.app.inject({
      method: "POST",
      url: "/api/auth/sign-out",
      headers,
      body: {
        test: "test",
      },
    });

    return {
      data: response.body ? JSON.parse(response.body) : null,
      cookies: response.cookies as SimpleCookie[],
      statusCode: response.statusCode,
      headers: response.headers,
    };
  }
}
