// Authentication Queries and Mutations
export const AUTH_QUERIES = {
  GET_ME: `
    query GetMe {
      me {
        id
        email
        name
        emailVerified
        createdAt
        updatedAt
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
    mutation CreateTodo($input: CreateTodoInput!) {
      createTodo(input: $input) {
        ... on Todo {
          id
          title
          content
          completed
          dueDate
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
