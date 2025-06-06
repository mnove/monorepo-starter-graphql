export const todosTypeDefs = /* GraphQL */ `
  type Todo {
    id: ID!
    title: String!
    content: String
    dueDate: DateTime
    completed: Boolean!
    categories: [Category!]
    createdAt: DateTime
    updatedAt: DateTime
  }

  input TodoCreateInput {
    title: String!
    content: String
    completed: Boolean
    dueDate: DateTime
    categoryIds: [ID!]
  }

  input TodoUpdateInput {
    id: ID!
    title: String
    content: String
    completed: Boolean
    dueDate: DateTime
    categoryIds: [ID!]
  }

  union TodoDeleteResult =
    | Todo
    | ValidationError
    | NotFoundError
    | UnauthorizedError
    | ServerError

  union TodoResult =
    | Todo
    | ValidationError
    | NotFoundError
    | ServerError
    | ConflictError
    | UnauthorizedError

  type TodoEdge {
    cursor: String!
    node: Todo!
  }

  type TodoConnection {
    edges: [TodoEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TodoListResult {
    connection: TodoConnection
    error: Error
  }

  input TodoFilterInput {
    title: String
    completed: Boolean
    categoryIds: [ID!]
  }

  type Query {
    todos(
      first: Int
      after: String
      last: Int
      before: String
      filter: TodoFilterInput
    ): TodoListResult!
    todoById(id: ID!): TodoResult!
  }

  type Mutation {
    createTodo(todo: TodoCreateInput!): TodoResult!
    updateTodo(todo: TodoUpdateInput!): TodoResult!
    deleteTodo(id: ID!): TodoDeleteResult!
    # completeTodo(id: ID!): TodoResult!
    bulkDeleteTodos(ids: [ID!]!): [TodoDeleteResult!]!
  }
`;
