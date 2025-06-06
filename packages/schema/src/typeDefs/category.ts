export const categoryTypeDefs = /* GraphQL */ `
  type Category {
    id: ID!
    name: String!
    description: String
    color: String
    todos: [Todo!]
    createdAt: DateTime
    updatedAt: DateTime
  }

  input CategoryCreateInput {
    name: String!
    description: String
    color: String
  }

  input CategoryUpdateInput {
    id: ID!
    name: String
    description: String
    color: String
  }

  union CategoryDeleteResult =
    | Category
    | ValidationError
    | NotFoundError
    | UnauthorizedError
    | ServerError

  union CategoryResult =
    | Category
    | ValidationError
    | NotFoundError
    | ServerError
    | ConflictError
    | UnauthorizedError

  type CategoryListResult {
    items: [Category]
    totalCount: Int
    error: Error
  }

  type Query {
    categories: CategoryListResult!
    categoryById(id: ID!): CategoryResult!
  }

  type Mutation {
    createCategory(category: CategoryCreateInput!): CategoryResult!
    updateCategory(category: CategoryUpdateInput!): CategoryResult!
    deleteCategory(id: ID!): CategoryDeleteResult!
    bulkDeleteCategories(ids: [ID!]!): [CategoryDeleteResult!]!
  }
`;
