import { createFileRoute } from "@tanstack/react-router";
import { SourceDetail } from "../features/sources";

export const Route = createFileRoute("/sources/$id")({
  component: SourceDetail,
});
