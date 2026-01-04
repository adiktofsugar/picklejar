import { FallbackProps } from "react-error-boundary";
import { GenericError } from "./GenericError";
import { useMemo } from "react";

const defaultRetryText = "Try Again?";

export interface ErrorFallbackProps extends FallbackProps {
  retry?: boolean | string | { text: string };
}

export function ErrorFallback({
  retry = true,
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  const retryConfig = useMemo(() => {
    if (!retry) return null;
    if (retry === true) return { text: defaultRetryText };
    if (typeof retry === "string") return { text: retry };
    return retry;
  }, [retry]);

  return (
    <GenericError
      message={String(error)}
      footer={
        retryConfig ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              resetErrorBoundary();
            }}
          >
            {retryConfig.text}
          </button>
        ) : null
      }
    />
  );
}
