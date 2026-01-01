import { createRouter } from "@tanstack/react-router";
import { routeTree } from "../generated/routes";
import { client } from "../shared/graphql-client";

export const router = createRouter({
  routeTree: routeTree,
  // disable router loader cache since I'm using apollo's cache
  defaultStaleTime: 0,
  defaultPreloadStaleTime: 0,
  defaultGcTime: 0,
  defaultPreloadGcTime: 0,
  // context
  context: {
    client,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
