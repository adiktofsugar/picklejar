import { createFileRoute } from "@tanstack/react-router";
import { SourceLoading, SourceNew } from "@/features/sources";
import { Suspense } from "react";
import { ErrorBoundary } from "@/shared/ErrorBoundary";

export const Route = createFileRoute("/sources/new")({
  beforeLoad: () => ({
    crumb: "New Source",
  }),
  component: SourceNewRoute,
});

function SourceNewRoute() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SourceLoading message="Creating new source" />}>
        <SourceNew />
      </Suspense>
    </ErrorBoundary>
  );
}
