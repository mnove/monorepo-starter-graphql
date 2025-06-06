export const errorTypeDefs = /* GraphQL */ `
  interface Error {
    message: String!
    code: String!
  }

  type ValidationError implements Error {
    message: String!
    code: String!
    field: String
  }

  type NotFoundError implements Error {
    message: String!
    code: String!
    resourceId: ID!
    resourceType: String!
  }

  type UnauthorizedError implements Error {
    message: String!
    code: String!
    operation: String!
  }

  type ServerError implements Error {
    message: String!
    code: String!
    details: String
  }

  type ConflictError implements Error {
    message: String!
    code: String!
    conflictingField: String
  }
`;
