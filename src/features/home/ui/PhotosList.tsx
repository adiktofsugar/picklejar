import { GetPhotosDocument } from "@/generated/graphql-operations";
import { useSuspenseQuery } from "@apollo/client/react";
import { useState } from "react";
import { PhotoItem } from "./PhotoItem";

export function PhotosList() {
  const [cursor, setCursor] = useState("");
  const { data } = useSuspenseQuery(GetPhotosDocument, {
    variables: { cursor },
  });
  const hasData = data.photos.edges.length > 0;
  if (!hasData) {
    <img
      src="/src/assets/pickle-dancing-on-a-jar.jpg"
      alt="pickle dancing on a jar"
    />;
  }
  return (
    <div>
      <ul>
        {data.photos.edges.map((edge) => (
          <li key={edge.node.id}>
            <PhotoItem token={edge.node.token} />
          </li>
        ))}
      </ul>
      {data.photos.pageInfo.hasNextPage && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setCursor(data.photos.pageInfo.endCursor!);
          }}
        >
          Next
        </button>
      )}
    </div>
  );
}
