import { GraphQLProvider } from "./GraphQlProvider";
import "./App.scss";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

export function App() {
  return (
    <GraphQLProvider>
      <RouterProvider router={router} />
    </GraphQLProvider>
  );
}
