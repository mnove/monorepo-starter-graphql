import { gql } from "../../generated/gql";

export const ERROR_FRAGMENTS = gql(/* GraphQL */ `
  fragment ValidationErrorFragment on ValidationError {
    __typename
    message
    code
    field
    fields {
      field
      message
    }
  }

  fragment NotFoundErrorFragment on NotFoundError {
    __typename
    message
    code
    resourceId
    resourceType
  }

  fragment ServerErrorFragment on ServerError {
    __typename
    message
    code
    details
  }

  fragment ConflictErrorFragment on ConflictError {
    __typename
    message
    code
    conflictingField
  }

  fragment UnauthorizedErrorFragment on UnauthorizedError {
    __typename
    message
    code
    operation
  }

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
`);
