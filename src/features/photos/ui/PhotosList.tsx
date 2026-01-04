import { GetPhotosDocument } from "@/generated/graphql-operations";
import { useSuspenseQuery } from "@apollo/client/react";
import { PhotoItem } from "./PhotoItem";

export function PhotosList() {
  const { data, fetchMore } = useSuspenseQuery(GetPhotosDocument, {
    variables: { cursor: null },
  });
  return (
    <div>
      <ul>
        {data.photos.edges.map((edge) => {
          return (
            <li key={edge.node.id}>
              <PhotoItem key={edge.node.key} sourceId={edge.node.sourceId} />
            </li>
          );
        })}
      </ul>
      {data.photos.pageInfo.hasNextPage && (
        <div>
          <button
            onClick={() => {
              fetchMore({
                variables: {
                  cursor: data.photos.pageInfo.endCursor,
                },
              });
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
