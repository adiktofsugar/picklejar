import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/sources")({
  staticData: {
    crumb: "Sources",
  },
  component: Outlet,
});
