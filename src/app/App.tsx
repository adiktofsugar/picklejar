import { GraphQLProvider } from "./GraphQlProvider";
import "./App.scss";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { client } from "../shared/graphql-client";

export function App() {
  return (
    <GraphQLProvider>
      <RouterProvider router={router} context={{ client }} />
    </GraphQLProvider>
  );
}
