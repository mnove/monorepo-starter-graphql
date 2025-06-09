import { gql } from "../../generated/gql";

export const CREATE_TODO = gql(/* GraphQL */ `
  mutation CREATE_TODO($todo: TodoCreateInput!) {
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
`);

export const DELETE_TODO = gql(/* GraphQL */ `
  mutation DELETE_TODO($id: ID!) {
    deleteTodo(id: $id) {
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
      ... on UnauthorizedError {
        ...UnauthorizedErrorFragment
      }
    }
  }
`);

export const BULK_DELETE_TODOS = gql(/* GraphQL */ `
  mutation BULK_DELETE_TODOS($ids: [ID!]!) {
    bulkDeleteTodos(ids: $ids) {
      ... on Todo {
        id
        title
        content
        completed
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
      ... on UnauthorizedError {
        ...UnauthorizedErrorFragment
      }
    }
  }
`);

export const UPDATE_TODO = gql(/* GraphQL */ `
  mutation UPDATE_TODO($todo: TodoUpdateInput!) {
    updateTodo(todo: $todo) {
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
      ... on UnauthorizedError {
        ...UnauthorizedErrorFragment
      }
    }
  }
`);
