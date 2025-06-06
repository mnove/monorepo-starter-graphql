import { FastifyInstance } from "fastify";

export class GraphQLTestClient {
  private sessionCookie: string = "";

  constructor(private app: FastifyInstance) {}

  setAuth(sessionCookie: string) {
    this.sessionCookie = sessionCookie;
  }

  clearAuth() {
    this.sessionCookie = "";
  }

  async query(query: string, variables?: Record<string, any>) {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (this.sessionCookie) {
      headers.cookie = this.sessionCookie;
    }

    const response = await this.app.inject({
      method: "POST",
      url: "/graphql",
      payload: {
        query,
        variables,
      },
      headers,
    });

    return {
      data: JSON.parse(response.body),
      status: response.statusCode,
      headers: response.headers,
    };
  }

  async mutate(mutation: string, variables?: Record<string, any>) {
    return this.query(mutation, variables);
  }

  async authenticatedQuery(
    query: string,
    sessionCookie: string,
    variables?: Record<string, any>
  ) {
    const originalCookie = this.sessionCookie;
    this.setAuth(sessionCookie);
    const result = await this.query(query, variables);
    this.sessionCookie = originalCookie;
    return result;
  }

  async authenticatedMutation(
    mutation: string,
    sessionCookie: string,
    variables?: Record<string, any>
  ) {
    return this.authenticatedQuery(mutation, sessionCookie, variables);
  }

  // Helper method to check if response has errors
  hasErrors(response: any): boolean {
    return (
      response.data && response.data.errors && response.data.errors.length > 0
    );
  }

  // Helper method to get first error message
  getFirstError(response: any): string | null {
    if (this.hasErrors(response)) {
      return response.data.errors[0].message;
    }
    return null;
  }

  // Helper method to get response data
  getData(response: any): any {
    return response.data?.data || null;
  }
}
