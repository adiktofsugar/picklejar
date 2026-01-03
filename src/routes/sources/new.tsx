import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import {
  SourceErrorFallback,
  SourceLoading,
  SourceNew,
} from "@/features/sources";
import { Suspense } from "react";

export const Route = createFileRoute("/sources/new")({
  beforeLoad: () => ({
    crumb: "New Source",
  }),
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
