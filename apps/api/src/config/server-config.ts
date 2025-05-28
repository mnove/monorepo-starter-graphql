/**
 * Configuration object for the server.
 */
export const serverConfig = {
  port: process.env.PORT || 5001,
  graphqlEndpoint: "/graphql",
  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:8080",
    "https://studio.apollographql.com",
  ],
  baseURL: process.env.BASE_SERVER_URL || "http://localhost:5001",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3001",
};
