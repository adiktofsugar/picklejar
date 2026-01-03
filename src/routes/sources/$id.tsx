import { createFileRoute } from "@tanstack/react-router";
import {
  SourceDetail,
  SourceLoading,
  SourceErrorFallback,
} from "@/features/sources";
import { Suspense } from "react";
import { GetSourcesIdDataDocument } from "@/generated/graphql-operations";
import { ErrorBoundary } from "react-error-boundary";

export const Route = createFileRoute("/sources/$id")({
  async beforeLoad({ params: { id }, context: { client } }) {
    const { data, error } = await client.query({
      query: GetSourcesIdDataDocument,
      variables: { id },
    });
    if (error) {
      throw error;
    }
    if (!data) throw new Error(`No data`);
    return { data, crumb: data.source.name };
  },
  async loader({ context: { data } }) {
    return data;
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
