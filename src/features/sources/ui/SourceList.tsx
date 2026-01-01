import { useSuspenseQuery } from "@apollo/client/react";
import { GetSourcesDocument } from "../../../generated/graphql-operations";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";

export function SourceList() {
  const {
    data: { sources },
  } = useSuspenseQuery(GetSourcesDocument);

  const list = useMemo(() => {
    if (sources.length) {
      return (
        <ul>
          {sources.map((source) => {
            return (
              <li key={source.id}>
                <Link to="/sources/$id" params={{ id: source.id }}>
                  {source.name}
                </Link>
              </li>
            );
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
