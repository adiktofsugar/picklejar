import { createFileRoute } from "@tanstack/react-router";
import { SourceDetail, SourceLoading } from "../features/sources";
import { Suspense } from "react";
import { GetSourcesIdDataDocument } from "../generated/graphql-operations";
import { ErrorBoundary } from "react-error-boundary";
import { SourceErrorFallback } from "../features/sources/ui/SourceErrorFallback";

export const Route = createFileRoute("/sources/$id")({
  async loader({ params: { id }, context: { client } }) {
    const { data, error } = await client.query({
      query: GetSourcesIdDataDocument,
      variables: { id },
    });
    if (error) {
      throw error;
    }
    return data!;
  },
  component: SourceDetailRoute,
});

function SourceDetailRoute() {
  const params = Route.useParams();
  return (
    <ErrorBoundary FallbackComponent={SourceErrorFallback}>
      <Suspense fallback={<SourceLoading message="Loading source" />}>
        <SourceDetail id={params.id} />
      </Suspense>
    </ErrorBoundary>
  );
}
