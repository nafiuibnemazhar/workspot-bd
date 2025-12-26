'use client';

// FIX: Import from '/react' to force the React version
import { ApolloProvider } from "@apollo/client/react"; 
import { client } from "@/lib/apollo";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}