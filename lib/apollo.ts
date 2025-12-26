import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  // Instead of just 'uri', we build the Link explicitly
  link: new HttpLink({
    uri: "http://workspot-backend.local/graphql",
    fetch, // We pass the global fetch to ensure it works on the Server
  }),
  cache: new InMemoryCache(),
});