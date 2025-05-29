import { gql } from "@/generated";

export const GET_CATEGORIES = gql(/* GraphQL */ `
  query Categories {
    categories {
      items {
        id
        name
        description
        color
        todos {
          id
        }
        createdAt
        updatedAt
      }
      totalCount
      error {
        ... on ValidationError {
          ...ValidationErrorFragment
        }
        ... on NotFoundError {
          ...NotFoundErrorFragment
        }
        ... on UnauthorizedError {
          ...UnauthorizedErrorFragment
        }
        ... on ServerError {
          ...ServerErrorFragment
        }
        ... on ConflictError {
          ...ConflictErrorFragment
        }
      }
    }
  }
`);

export const GET_CATEGORY_BY_ID = gql(/* GraphQL */ `
  query GET_CATEGORY_BY_ID($categoryByIdId: ID!) {
    categoryById(id: $categoryByIdId) {
      ... on Category {
        id
        name
        description
        color
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
