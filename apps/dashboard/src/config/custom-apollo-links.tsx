//@ts-nocheck
import { ApolloLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
// measure Graphql Operations time
//https://stackoverflow.com/questions/56502738/what-is-the-right-way-to-log-a-request-time-using-the-apollo-graphql-client?answertab=active#tab-top
export const timeStartLink = new ApolloLink((operation, forward) => {
  operation.setContext({ start: new Date() });
  return forward(operation);
});

export const logTimeLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((data) => {
    // data from a previous link
    const time = new Date() - operation.getContext().start;
    console.log(
      `Operation ${operation.operationName} took ${time}ms to complete`
    );
    return data;
  });
});

//?INFO https://www.apollographql.com/docs/react/data/error-handling/#advanced-error-handling-with-apollo-link
export const errorLink = onError(
  ({ graphQLErrors, networkError, operation, response }) => {
    // console.log(JSON.stringify(graphQLErrors));
    console.log(JSON.stringify(response));

    if (graphQLErrors)
      graphQLErrors.forEach(
        ({
          message,
          locations,
          path,
          positions,
          source,
          originalError,
          name,
          stack,
          extensions,
        }) => {
          console.error(
            `[GraphQL error]: Message: ${message}. \n Location: ${JSON.stringify(
              locations
            )}, \n Operation Name: ${JSON.stringify(
              operation?.operationName
            )}, \n Extensions: ${JSON.stringify(extensions.code)}`
          );

          if (extensions.code)
            console.error("Extensions.code", extensions.code);
          console.log(message);
          if (message === "NOT_AUTHENTICATED") {
            localStorage.setItem("isAuth", false);
            window.location.reload(); // force a reload of the page so we get prompt to login
          }

          return;
        }
      );

    if (networkError) console.error(`[Network error]: ${networkError}`);
  }
);
