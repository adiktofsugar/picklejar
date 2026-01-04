import { createFileRoute } from "@tanstack/react-router";
import { SourceList, SourceLoading } from "@/features/sources";
import { Suspense } from "react";
import { ErrorBoundary } from "@/shared/ErrorBoundary";

export const Route = createFileRoute("/sources/")({
  component: () => (
    <ErrorBoundary>
      <Suspense fallback={<SourceLoading message="Loading sources list" />}>
        <SourceList />
      </Suspense>
    </ErrorBoundary>
  ),
});
