import { FastifyInstance } from "fastify";
import { print } from "graphql";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export class GraphQLTestClient {
  private sessionCookie: string = "";

  constructor(private app: FastifyInstance) {}

  setAuth(sessionCookie: string) {
    this.sessionCookie = sessionCookie;
  }

  clearAuth() {
    this.sessionCookie = "";
  }

  // Helper method to convert GraphQL document to string
  private getQueryString(query: string | any): string {
    if (typeof query === "string") {
      return query;
    }

    // If it's a GraphQL document object from codegen
    if (query && typeof query === "object" && query.definitions) {
      return print(query);
    }

    // If it's wrapped in an object (common with codegen)
    if (query && typeof query === "object" && query.query) {
      return typeof query.query === "string" ? query.query : print(query.query);
    }

    throw new Error(
      "Invalid query format. Expected string or GraphQL document."
    );
  }

  async query(query: string | any, variables?: Record<string, any>) {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (this.sessionCookie) {
      headers.cookie = this.sessionCookie;
    }

    const queryString = this.getQueryString(query);

    // console.log("GraphQL Query Headers:", headers);
    // console.log("GraphQL Query:", queryString);

    const response = await this.app.inject({
      method: "POST",
      url: "/graphql",
      payload: {
        query: queryString,
        variables,
      },
      headers,
    });

    // console.log("GraphQL Response Status:", response.statusCode);
    // console.log("GraphQL Response Body:", response.body);

    return {
      data: JSON.parse(response.body),
      status: response.statusCode,
      headers: response.headers,
    };
  }

  async mutate(mutation: string | any, variables?: Record<string, any>) {
    return this.query(mutation, variables);
  }

  async authenticatedQuery(
    query: string | any,
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
    mutation: string | any,
    sessionCookie: string,
    variables?: Record<string, any>
  ) {
    // return this.authenticatedQuery(mutation, sessionCookie, variables);

    const originalCookie = this.sessionCookie;
    this.setAuth(sessionCookie);
    const result = await this.mutate(mutation, variables);
    this.sessionCookie = originalCookie;
    return result;
  }

  // Helper method to check if response has errors
  hasErrors(response: any): boolean {
    // Check for traditional GraphQL errors
    if (
      response.data &&
      response.data.errors &&
      response.data.errors.length > 0
    ) {
      return true;
    }

    // Check for union type errors (ValidationError, NotFoundError, etc.)
    if (response.data?.data) {
      const data = response.data.data;
      // Check each field in the response for error types
      for (const key in data) {
        const field = data[key];
        if (field && typeof field === "object" && field.__typename) {
          // Check if __typename indicates an error type
          if (field.__typename.includes("Error")) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // Helper method to get first error message
  getFirstError(response: any): string | null {
    // Check for traditional GraphQL errors first
    if (
      response.data &&
      response.data.errors &&
      response.data.errors.length > 0
    ) {
      return response.data.errors[0].message;
    }

    // Check for union type errors
    if (response.data?.data) {
      const data = response.data.data;
      for (const key in data) {
        const field = data[key];
        if (field && typeof field === "object" && field.__typename) {
          if (field.__typename.includes("Error") && field.message) {
            return field.message;
          }
        }
      }
    }

    return null;
  }

  // Helper method to get response data
  getData(response: any): any {
    return response.data?.data || null;
  }
}

// import { FastifyInstance } from "fastify";
// import { print } from "graphql";
// import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export class TypedGraphQLTestClient {
  private sessionCookie: string = "";

  constructor(private app: FastifyInstance) {}

  setAuth(sessionCookie: string) {
    this.sessionCookie = sessionCookie;
  }

  clearAuth() {
    this.sessionCookie = "";
  }

  private getQueryString(query: string | TypedDocumentNode<any, any>): string {
    if (typeof query === "string") {
      return query;
    }

    // If it's a TypedDocumentNode from codegen
    if (query && typeof query === "object" && query.definitions) {
      return print(query);
    }

    throw new Error(
      "Invalid query format. Expected string or TypedDocumentNode."
    );
  }

  async query<TResult = any, TVariables = Record<string, any>>(
    query: TypedDocumentNode<TResult, TVariables> | string,
    variables?: TVariables
  ): Promise<{
    data: { data?: TResult; errors?: any[] };
    status: number;
    headers: Record<string, any>;
  }> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (this.sessionCookie) {
      headers.cookie = this.sessionCookie;
    }

    const queryString = this.getQueryString(query);

    const response = await this.app.inject({
      method: "POST",
      url: "/graphql",
      payload: {
        query: queryString,
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

  async mutate<TResult = any, TVariables = Record<string, any>>(
    mutation: TypedDocumentNode<TResult, TVariables> | string,
    variables?: TVariables
  ): Promise<{
    data: { data?: TResult; errors?: any[] };
    status: number;
    headers: Record<string, any>;
  }> {
    return this.query(mutation, variables);
  }

  async authenticatedQuery<TResult = any, TVariables = Record<string, any>>(
    query: TypedDocumentNode<TResult, TVariables> | string,
    sessionCookie: string,
    variables?: TVariables
  ) {
    const originalCookie = this.sessionCookie;
    this.setAuth(sessionCookie);
    const result = await this.query(query, variables);
    this.sessionCookie = originalCookie;
    return result;
  }

  async authenticatedMutation<TResult = any, TVariables = Record<string, any>>(
    mutation: TypedDocumentNode<TResult, TVariables> | string,
    sessionCookie: string,
    variables?: TVariables
  ) {
    const originalCookie = this.sessionCookie;
    this.setAuth(sessionCookie);
    const result = await this.mutate(mutation, variables);
    this.sessionCookie = originalCookie;
    return result;
  }

  // Type-safe helper methods
  hasErrors<T>(response: { data: { data?: T; errors?: any[] } }): boolean {
    if (response.data.errors && response.data.errors.length > 0) {
      return true;
    }

    // Check for union type errors in the data
    if (response.data.data) {
      const data = response.data.data as any;
      for (const key in data) {
        const field = data[key];
        if (field && typeof field === "object" && field.__typename) {
          if (field.__typename.includes("Error")) {
            return true;
          }
        }
      }
    }

    return false;
  }

  getFirstError<T>(response: {
    data: { data?: T; errors?: any[] };
  }): string | null {
    if (response.data.errors && response.data.errors.length > 0) {
      return response.data.errors[0].message;
    }

    if (response.data.data) {
      const data = response.data.data as any;
      for (const key in data) {
        const field = data[key];
        if (field && typeof field === "object" && field.__typename) {
          if (field.__typename.includes("Error") && field.message) {
            return field.message;
          }
        }
      }
    }

    return null;
  }

  getData<T>(response: { data: { data?: T; errors?: any[] } }): T | null {
    return response.data.data || null;
  }
}
