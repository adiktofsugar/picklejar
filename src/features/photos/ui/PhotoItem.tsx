import { useState } from "react";

export function PhotoItem({ token }: { token: string }) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return <p>Error loading image</p>;
  }
  return (
    <img
      onError={(e) => {
        console.error(`Error loading image: ${e}`);
        setHasError(true);
      }}
      src={`/api/photos/${token}`}
    />
  );
}
