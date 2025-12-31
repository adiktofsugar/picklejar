import { ApolloProvider } from "@apollo/client/react";
import React from "react";
import { client } from "../shared/graphql-client";

export function GraphQLProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
