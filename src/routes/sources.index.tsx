import { createFileRoute } from "@tanstack/react-router";
import { SourceList } from "../features/sources/ui/SourceList";

export const Route = createFileRoute("/sources/")({
  component: SourceList,
});
