import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import { SourceErrorFallback, SourceLoading } from "../features/sources";
import { Suspense } from "react";
import { SourceNew } from "../features/sources";

export const Route = createFileRoute("/sources/new")({
  component: SourceNewRoute,
});

function SourceNewRoute() {
  return (
    <ErrorBoundary FallbackComponent={SourceErrorFallback}>
      <Suspense fallback={<SourceLoading message="Creating new source" />}>
        <SourceNew />
      </Suspense>
    </ErrorBoundary>
  );
}
