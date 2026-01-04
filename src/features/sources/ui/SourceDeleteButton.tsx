import {
  DeleteSourceDocument,
  GetSourcesDocument,
} from "@/generated/graphql-operations";
import { useMutation } from "@apollo/client/react";
import { useEffect } from "react";

export function SourceDeleteButton({
  id,
  onComplete,
}: {
  id: string;
  onComplete: () => unknown;
}) {
  const [deleteSource, { loading, error, called }] = useMutation(
    DeleteSourceDocument,
    {
      variables: { input: { id } },
      refetchQueries: [GetSourcesDocument],
    },
  );
  useEffect(() => {
    if (called) {
      onComplete();
    }
  }, [called, onComplete]);
  if (error) {
    throw error;
  }
  if (called) {
    return null;
  }
  return (
    <button
      aria-busy={loading}
      disabled={loading}
      onClick={() => {
        deleteSource();
      }}
    >
      Delete
    </button>
  );
}
