import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals.ts";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  from,
} from "@apollo/client";
import {
  errorLink,
  logTimeLink,
  timeStartLink,
} from "./config/custom-apollo-links.tsx";
import { relayStylePagination } from "@apollo/client/utilities";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Get correct URI based on the environment
const reactAppAPIUrl =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5001/graphql";

console.log("API URL:", reactAppAPIUrl);

// https link (communicates with Server)
const link = createHttpLink({
  uri: reactAppAPIUrl,
  credentials: "include", // to include https cookies with the JWT token
});

// Read more here: https://www.apollographql.com/docs/react/api/link/introduction/#additive-composition
// "link" should be the last one of the chain as it is a terminating link
const additiveLink = from([errorLink, timeStartLink, logTimeLink, link]);

const apolloClient = new ApolloClient({
  uri: reactAppAPIUrl,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          todos: relayStylePagination(["id"]),
        },
      },
    },
  }),
  link: additiveLink,
  // Required for useSuspenseQuery
  // connectToDevTools: true,
  queryDeduplication: false,
  defaultOptions: {
    // This enables appropriate defaults for useSuspenseQuery
    watchQuery: {
      nextFetchPolicy: "cache-first",
    },
  },
});

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
