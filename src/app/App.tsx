import { GraphQLProvider } from "./GraphQlProvider";
import { Home } from "../features/home";
import "./App.scss";

export function App() {
  return (
    <GraphQLProvider>
      <Home />
    </GraphQLProvider>
  );
}
