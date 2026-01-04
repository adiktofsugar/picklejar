import { useState } from "react";

export function PhotoItem({
  key,
  sourceId,
}: {
  key: string;
  sourceId: number;
}) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <p>
        Error loading image with key {key} from source {sourceId}
      </p>
    );
  }
  return (
    <img
      onError={(e) => {
        console.error(
          `Error loading image ${key} from source ${sourceId}: ${e}`,
        );
        setHasError(true);
      }}
      src={`/api/photo/${sourceId}/${key}`}
    />
  );
}
