import { createFileRoute } from "@tanstack/react-router";
import { SourceList } from "../features/sources";

export const Route = createFileRoute("/sources/new")({
  component: SourceList,
});
