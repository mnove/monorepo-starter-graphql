export const userTypeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
    emailVerified: Boolean!
    createdAt: DateTime
    updatedAt: DateTime
  }

  union UserResult = User | NotFoundError | ServerError | UnauthorizedError

  type Query {
    viewer: UserResult!
    # userById(id: ID!): UserResult!
  }
`;
