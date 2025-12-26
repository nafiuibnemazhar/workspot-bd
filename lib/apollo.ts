import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://workspot-backend.local/graphql",
});

const authLink = setContext((_, { headers }) => {
  // Get the token from storage (Client-side only)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("workspot_token") : "";

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
