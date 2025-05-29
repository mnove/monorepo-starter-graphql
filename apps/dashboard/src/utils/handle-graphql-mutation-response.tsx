// import { toast } from "sonner";

// type ErrorResponse = {
//   __typename?: string;
//   message?: string;
//   code?: string;
//   field?: string | null;
//   resourceId?: string;
//   resourceType?: string;
//   details?: string | null;
//   conflictingField?: string | null;
//   operation?: string;
// };

// type ErrorHandlerOptions = {
//   showToast?: boolean;
//   logToConsole?: boolean;
//   onSuccess?: () => void;
//   customMessages?: {
//     [key: string]: string | ((error: ErrorResponse) => string);
//   };
// };

// const defaultErrorMessages: Record<string, string> = {
//   ValidationError: "Validation error",
//   NotFoundError: "Resource not found",
//   ServerError: "Server error occurred",
//   ConflictError: "Conflict error",
//   UnauthorizedError: "Unauthorized action",
// };

// /**
//  * Handles GraphQL mutation responses with potential errors
//  *
//  * @param response The GraphQL response object with __typename
//  * @param entityName The name of the entity being operated on (e.g. "Todo", "Category")
//  * @param operation The operation being performed (e.g. "create", "update", "delete")
//  * @param options Additional options for error handling
//  * @returns Whether the operation was successful
//  */
// export function handleGraphQLResponse<T extends ErrorResponse>(
//   response: T | null | undefined,
//   entityName: string,
//   operation: string,
//   options: ErrorHandlerOptions = {}
// ): boolean {
//   const {
//     showToast = true,
//     logToConsole = true,
//     onSuccess,
//     customMessages = {},
//   } = options;

//   if (!response) {
//     if (showToast)
//       toast.error(
//         `No response received for ${operation} ${entityName.toLowerCase()}`
//       );
//     if (logToConsole)
//       console.error(`No response for ${operation} ${entityName}`);
//     return false;
//   }

//   // Define success types based on entity name
//   const successTypes = [entityName];

//   if (successTypes.includes(response.__typename as string)) {
//     if (showToast) toast.success(`${entityName} ${operation}d successfully!`);
//     if (onSuccess) onSuccess();
//     return true;
//   }

//   // Handle error case
//   if (response.__typename && response.__typename !== entityName) {
//     const errorType = response.__typename;

//     let errorMessage: string;
//     if (errorType in customMessages) {
//       const customMessage = customMessages[errorType];
//       errorMessage =
//         typeof customMessage === "function"
//           ? customMessage(response)
//           : customMessage;
//     } else {
//       errorMessage =
//         defaultErrorMessages[errorType] ||
//         `An error occurred while ${operation}ing the ${entityName.toLowerCase()}`;
//     }

//     if (showToast) toast.error(errorMessage);

//     if (logToConsole) {
//       console.error(`Error ${operation}ing ${entityName}:`, {
//         type: errorType,
//         details: response,
//       });
//     }

//     return false;
//   }

//   // Fallback for unexpected response structure
//   if (showToast)
//     toast.error(
//       `An unexpected error occurred while ${operation}ing the ${entityName.toLowerCase()}`
//     );
//   if (logToConsole) console.error(`Unexpected response structure:`, response);
//   return false;
// }

import { toast } from "sonner";

// Define all possible error types
export enum GraphQLErrorType {
  ValidationError = "ValidationError",
  NotFoundError = "NotFoundError",
  ServerError = "ServerError",
  ConflictError = "ConflictError",
  UnauthorizedError = "UnauthorizedError",
}

type ErrorResponse = {
  __typename?: string;
  message?: string;
  code?: string;
  field?: string | null;
  resourceId?: string;
  resourceType?: string;
  details?: string | null;
  conflictingField?: string | null;
  operation?: string;
};

// Create specific typed interfaces for each error type
interface ValidationErrorResponse extends ErrorResponse {
  __typename: GraphQLErrorType.ValidationError;
  field: string | null;
}

interface NotFoundErrorResponse extends ErrorResponse {
  __typename: GraphQLErrorType.NotFoundError;
  resourceId: string;
  resourceType: string;
}

interface ServerErrorResponse extends ErrorResponse {
  __typename: GraphQLErrorType.ServerError;
  details: string | null;
}

interface ConflictErrorResponse extends ErrorResponse {
  __typename: GraphQLErrorType.ConflictError;
  conflictingField: string | null;
}

interface UnauthorizedErrorResponse extends ErrorResponse {
  __typename: GraphQLErrorType.UnauthorizedError;
  operation: string;
}

// Type-safe custom messages map
type CustomMessagesMap = {
  [GraphQLErrorType.ValidationError]?:
    | string
    | ((error: ValidationErrorResponse) => string);
  [GraphQLErrorType.NotFoundError]?:
    | string
    | ((error: NotFoundErrorResponse) => string);
  [GraphQLErrorType.ServerError]?:
    | string
    | ((error: ServerErrorResponse) => string);
  [GraphQLErrorType.ConflictError]?:
    | string
    | ((error: ConflictErrorResponse) => string);
  [GraphQLErrorType.UnauthorizedError]?:
    | string
    | ((error: UnauthorizedErrorResponse) => string);
};

type ErrorHandlerOptions = {
  showToast?: boolean;
  logToConsole?: boolean;
  onSuccess?: () => void;
  customMessages?: CustomMessagesMap;
};

const defaultErrorMessages: Record<string, string> = {
  [GraphQLErrorType.ValidationError]: "Validation error",
  [GraphQLErrorType.NotFoundError]: "Resource not found",
  [GraphQLErrorType.ServerError]: "Server error occurred",
  [GraphQLErrorType.ConflictError]: "Conflict error",
  [GraphQLErrorType.UnauthorizedError]: "Unauthorized action",
};

/**
 * Handles GraphQL mutation responses with potential errors
 *
 * @param response The GraphQL response object with __typename
 * @param entityName The name of the entity being operated on (e.g. "Todo", "Category")
 * @param operation The operation being performed (e.g. "create", "update", "delete")
 * @param options Additional options for error handling
 * @returns Whether the operation was successful
 */
export function handleGraphQLResponse<T extends ErrorResponse>(
  response: T | null | undefined,
  entityName: string,
  operation: string,
  options: ErrorHandlerOptions = {}
): boolean {
  const {
    showToast = true,
    logToConsole = true,
    onSuccess,
    customMessages = {},
  } = options;

  if (!response) {
    if (showToast)
      toast.error(
        `No response received for ${operation} ${entityName.toLowerCase()}`
      );
    if (logToConsole)
      console.error(`No response for ${operation} ${entityName}`);
    return false;
  }

  // Define success types based on entity name
  const successTypes = [entityName];

  if (successTypes.includes(response.__typename as string)) {
    if (showToast) toast.success(`${entityName} ${operation}d successfully!`);
    if (onSuccess) onSuccess();
    return true;
  }

  // Handle error case
  if (response.__typename && response.__typename !== entityName) {
    const errorType = response.__typename;

    // Type assertion to handle different error types
    let errorMessage: string;

    if (errorType in customMessages) {
      const customMessage = customMessages[errorType as GraphQLErrorType];
      if (typeof customMessage === "function") {
        // Type assertion to make TypeScript happy
        switch (errorType) {
          case GraphQLErrorType.ValidationError:
            errorMessage = (
              customMessage as (error: ValidationErrorResponse) => string
            )(response as ValidationErrorResponse);
            break;
          case GraphQLErrorType.NotFoundError:
            errorMessage = (
              customMessage as (error: NotFoundErrorResponse) => string
            )(response as NotFoundErrorResponse);
            break;
          case GraphQLErrorType.ServerError:
            errorMessage = (
              customMessage as (error: ServerErrorResponse) => string
            )(response as ServerErrorResponse);
            break;
          case GraphQLErrorType.ConflictError:
            errorMessage = (
              customMessage as (error: ConflictErrorResponse) => string
            )(response as ConflictErrorResponse);
            break;
          case GraphQLErrorType.UnauthorizedError:
            errorMessage = (
              customMessage as (error: UnauthorizedErrorResponse) => string
            )(response as UnauthorizedErrorResponse);
            break;
          default:
            errorMessage = `An error occurred while ${operation}ing the ${entityName.toLowerCase()}`;
        }
      } else {
        // String message
        errorMessage = customMessage as string;
      }
    } else {
      errorMessage =
        defaultErrorMessages[errorType] ||
        `An error occurred while ${operation}ing the ${entityName.toLowerCase()}`;
    }

    if (showToast) toast.error(errorMessage);

    if (logToConsole) {
      console.error(`Error ${operation}ing ${entityName}:`, {
        type: errorType,
        details: response,
      });
    }

    return false;
  }

  // Fallback for unexpected response structure
  if (showToast)
    toast.error(
      `An unexpected error occurred while ${operation}ing the ${entityName.toLowerCase()}`
    );
  if (logToConsole) console.error(`Unexpected response structure:`, response);
  return false;
}
