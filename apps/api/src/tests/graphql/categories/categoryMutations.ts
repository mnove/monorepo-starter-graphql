import { gql } from "../../generated/gql";

export const CREATE_CATEGORY = gql(/* GraphQL */ `
  mutation CREATE_CATEGORY($category: CategoryCreateInput!) {
    createCategory(category: $category) {
      ... on Category {
        __typename
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

export const DELETE_CATEGORY = gql(/* GraphQL */ `
  mutation DELETE_CATEGORY($deleteCategoryId: ID!) {
    deleteCategory(id: $deleteCategoryId) {
      ... on Category {
        __typename
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
      ... on UnauthorizedError {
        ...UnauthorizedErrorFragment
      }
      ... on ServerError {
        ...ServerErrorFragment
      }
    }
  }
`);

export const BULK_DELETE_CATEGORIES = gql(/* GraphQL */ `
  mutation BULK_DELETE_CATEGORIES($ids: [ID!]!) {
    bulkDeleteCategories(ids: $ids) {
      ... on Category {
        __typename
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
    }
  }
`);

export const UPDATE_CATEGORY = gql(/* GraphQL */ `
  mutation UPDATE_CATEGORY($category: CategoryUpdateInput!) {
    updateCategory(category: $category) {
      ... on Category {
        __typename
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
