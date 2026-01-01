import { createRouter } from "@tanstack/react-router";
import { routeTree } from "../generated/routes";

export const router = createRouter({
  routeTree: routeTree,
});
