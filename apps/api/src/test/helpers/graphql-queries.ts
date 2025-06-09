export const FRAGMENTS = {
  VALIDATION_ERROR: `
    fragment ValidationErrorFragment on ValidationError {
      message
      code
      field
    }
  `,

  NOT_FOUND_ERROR: `
    fragment NotFoundErrorFragment on NotFoundError {
      message
      code
      resourceId
      resourceType
    }
  `,

  SERVER_ERROR: `
    fragment ServerErrorFragment on ServerError {
      message
      code
      details
    }
  `,

  CONFLICT_ERROR: `
    fragment ConflictErrorFragment on ConflictError {
      message
      code
      conflictingField
    }
  `,

  UNAUTHORIZED_ERROR: `
    fragment UnauthorizedErrorFragment on UnauthorizedError {
      message
      code
      operation
    }
  `,

  ERROR: `
    fragment ErrorFragment on Error {
      ... on ValidationError {
        ...ValidationErrorFragment
      }
      ... on NotFoundError {
        ...NotFoundErrorFragment
      }
      ... on ServerError {
        ...ServerErrorFragment
      }
      ... on ConflictError {
        ...ConflictErrorFragment
      }
      ... on UnauthorizedError {
        ...UnauthorizedErrorFragment
      }
    }
  `,
};

// Authentication Queries and Mutations
export const AUTH_QUERIES = {
  GET_ME: `
    query GetMe {
      viewer {
       ... on User {
            id
            name
            email
            emailVerified
            createdAt
            updatedAt
        }
      }
    }
  `,
};

// Todo Queries and Mutations
export const TODO_QUERIES = {
  GET_TODOS: `
    query GetTodos {
      todos {
        id
        title
        content
        completed
        dueDate
        createdAt
        updatedAt
        authorId
        categories {
          category {
            id
            name
            color
          }
        }
      }
    }
  `,

  GET_TODO_BY_ID: `
    query GetTodoById($id: ID!) {
      todo(id: $id) {
        id
        title
        content
        completed
        dueDate
        createdAt
        updatedAt
        authorId
        categories {
          category {
            id
            name
            color
          }
        }
      }
    }
  `,
};

export const TODO_MUTATIONS = {
  CREATE_TODO: `
    ${FRAGMENTS.VALIDATION_ERROR}
    ${FRAGMENTS.NOT_FOUND_ERROR}
    ${FRAGMENTS.SERVER_ERROR}
    ${FRAGMENTS.CONFLICT_ERROR}
    ${FRAGMENTS.UNAUTHORIZED_ERROR}

  mutation Create_Todo($todo: TodoCreateInput!) {
    createTodo(todo: $todo) {
      ... on Todo {
        id
        title
        content
        completed
        dueDate
        createdAt
        updatedAt
      }
      ... on ValidationError {
        ...ValidationErrorFragment
      }
      ... on NotFoundError {
        ...NotFoundErrorFragment
      }
      ... on ServerError {
        ...ServerErrorFragment
      }
      ... on ConflictError {
        ...ConflictErrorFragment
      }
    }
  }
  `,

  UPDATE_TODO: `
    mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
      updateTodo(id: $id, input: $input) {
        ... on Todo {
          id
          title
          content
          completed
          dueDate
          authorId
          updatedAt
        }
        ... on Error {
          message
        }
      }
    }
  `,

  DELETE_TODO: `
    mutation DeleteTodo($id: ID!) {
      deleteTodo(id: $id) {
        ... on DeleteResult {
          success
        }
        ... on Error {
          message
        }
      }
    }
  `,

  TOGGLE_TODO: `
    mutation ToggleTodo($id: ID!) {
      toggleTodo(id: $id) {
        ... on Todo {
          id
          completed
          updatedAt
        }
        ... on Error {
          message
        }
      }
    }
  `,
};

// Category Queries and Mutations
export const CATEGORY_QUERIES = {
  GET_CATEGORIES: `
    query GetCategories {
      categories {
        id
        name
        description
        color
        createdAt
        updatedAt
        authorId
        todos {
          todo {
            id
            title
            completed
          }
        }
      }
    }
  `,

  GET_CATEGORY_BY_ID: `
    query GetCategoryById($id: ID!) {
      category(id: $id) {
        id
        name
        description
        color
        createdAt
        updatedAt
        authorId
        todos {
          todo {
            id
            title
            completed
          }
        }
      }
    }
  `,
};

export const CATEGORY_MUTATIONS = {
  CREATE_CATEGORY: `
    mutation CreateCategory($input: CreateCategoryInput!) {
      createCategory(input: $input) {
        ... on Category {
          id
          name
          description
          color
          authorId
          createdAt
          updatedAt
        }
        ... on Error {
          message
        }
      }
    }
  `,

  UPDATE_CATEGORY: `
    mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
      updateCategory(id: $id, input: $input) {
        ... on Category {
          id
          name
          description
          color
          authorId
          updatedAt
        }
        ... on Error {
          message
        }
      }
    }
  `,

  DELETE_CATEGORY: `
    mutation DeleteCategory($id: ID!) {
      deleteCategory(id: $id) {
        ... on DeleteResult {
          success
        }
        ... on Error {
          message
        }
      }
    }
  `,
};
