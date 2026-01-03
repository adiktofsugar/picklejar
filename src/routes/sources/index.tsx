import { createFileRoute } from "@tanstack/react-router";
import {
  SourceErrorFallback,
  SourceList,
  SourceLoading,
} from "@/features/sources";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

export const Route = createFileRoute("/sources/")({
  component: () => (
    <ErrorBoundary FallbackComponent={SourceErrorFallback}>
      <Suspense fallback={<SourceLoading message="Loading sources list" />}>
        <SourceList />
      </Suspense>
    </ErrorBoundary>
  ),
});
