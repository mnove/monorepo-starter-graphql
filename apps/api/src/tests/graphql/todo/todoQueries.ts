import { gql } from "../../generated/gql";

export const GET_TODOS = gql(/* GraphQL */ `
  query GET_TODOS(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $filter: TodoFilterInput
  ) {
    todos(
      first: $first
      after: $after
      last: $last
      before: $before
      filter: $filter
    ) {
      __typename
      connection {
        edges {
          cursor
          node {
            id
            title
            dueDate
            createdAt
            content
            completed
            updatedAt
            categories {
              id
              name
              color
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
      error {
        ... on ValidationError {
          message
          code
          field
        }
        ... on NotFoundError {
          message
          code
          resourceId
          resourceType
        }
        ... on UnauthorizedError {
          message
          code
          operation
        }
        ... on ServerError {
          message
          code
          details
        }
        ... on ConflictError {
          message
          code
          conflictingField
        }
      }
    }
  }
`);

export const GET_TODO_BY_ID = gql(/* GraphQL */ `
  query GET_TODO_BY_ID($todoByIdId: ID!) {
    todoById(id: $todoByIdId) {
      ... on Todo {
        __typename
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
