import { GetPhotosDocument } from "@/generated/graphql-operations";
import { useSuspenseQuery } from "@apollo/client/react";
import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";

export function PhotosList() {
  const [cursor, setCursor] = useState("");
  const { data } = useSuspenseQuery(GetPhotosDocument, {
    variables: { cursor },
  });

  const photos = data.photos.edges.map((edge) => ({
    src: `/api/photos/${edge.node.token}`,
    width: edge.node.width,
    height: edge.node.height,
    key: edge.node.id,
  }));

  if (photos.length === 0) {
    return (
      <img
        src="/src/assets/pickle-dancing-on-a-jar.jpg"
        alt="pickle dancing on a jar"
      />
    );
  }

  return (
    <div>
      <RowsPhotoAlbum photos={photos} targetRowHeight={200} />
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
