import { ZodError } from "zod";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  ServerError,
} from "@repo/schema";

export const createValidationError = (
  error: ZodError
): ValidationError & { __typename: "ValidationError" } => {
  const issues = error.issues;
  const firstIssue = issues[0];

  return {
    __typename: "ValidationError" as const,
    message:
      issues.length === 1
        ? firstIssue?.message || "Validation error"
        : `${issues.length} validation errors occurred`,
    code: "VALIDATION_ERROR",
    field: firstIssue?.path.join(".") || undefined,
    fields: issues.map((issue) => ({
      field: issue.path.join(".") || "unknown",
      message: issue.message,
    })),
  };
};

export const createNotFoundError = (
  resourceId: string,
  resourceType: string
): NotFoundError & { __typename: "NotFoundError" } => {
  return {
    __typename: "NotFoundError" as const,
    message: `${resourceType} with id ${resourceId} not found`,
    code: "NOT_FOUND",
    resourceId,
    resourceType,
  };
};

export const createUnauthorizedError = (
  operation: string
): UnauthorizedError & { __typename: "UnauthorizedError" } => {
  return {
    __typename: "UnauthorizedError" as const,
    message: `Unauthorized to perform ${operation}`,
    code: "UNAUTHORIZED",
    operation,
  };
};

export const createServerError = (
  message: string,
  details?: string
): ServerError & { __typename: "ServerError" } => {
  return {
    __typename: "ServerError" as const,
    message: message || "Internal server error",
    code: "SERVER_ERROR",
    details: details || undefined,
  };
};

export const createConflictError = (
  message: string,
  conflictingField?: string
): ConflictError & { __typename: "ConflictError" } => {
  return {
    __typename: "ConflictError" as const,
    message: message || "Operation caused a conflict",
    code: "CONFLICT",
    conflictingField: conflictingField || undefined,
  };
};
