import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { GetSourcesDocument } from "../generated/graphql";
import { LoaderError } from "../shared/LoaderError";

export const Route = createFileRoute("/sources/")({
  component: SourceList,
  async loader({ context: { client } }) {
    const { data, error } = await client.query({
      query: GetSourcesDocument,
    });
    if (error) {
      throw error;
    }
    return data!; // should only be undefined if there was an error
  },
  errorComponent: ({ error }) => <LoaderError message={error.message} />,
});

function SourceList() {
  const { sources } = Route.useLoaderData();
  const list = useMemo(() => {
    if (sources.length) {
      return (
        <ul>
          {sources.map((source) => {
            return <li key={source.id}>{source.name}</li>;
          })}
        </ul>
      );
    }
    return <article>No sources configured</article>;
  }, [sources]);

  return (
    <div>
      <p>
        Sources are where your media comes from. They need to be writable, too,
        so we can add the generated AI descriptions. Once added, we can scan
        them and start displaying your content.
      </p>
      {list}
      <Link to="/sources/new">Add new source</Link>
    </div>
  );
}
