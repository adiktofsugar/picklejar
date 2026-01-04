import {
  ErrorBoundary as BaseErrorBoundary,
  ErrorBoundaryProps,
  FallbackProps,
} from "react-error-boundary";
import { ErrorFallback, ErrorFallbackProps } from "./ErrorFallback";

/**
 * Wrapper over react-error-boundary. Designed to provide custom FallbackComponent with merged props.
 *
 */
export function ErrorBoundary(
  props: Pick<
    ErrorBoundaryProps,
    "onError" | "onReset" | "resetKeys" | "children"
  > &
    Omit<ErrorFallbackProps, keyof FallbackProps>,
) {
  const { retry, ...rest } = props;
  return (
    <BaseErrorBoundary
      {...rest}
      fallbackRender={(fallbackProps) => (
        <ErrorFallback {...fallbackProps} retry={retry} />
      )}
    />
  );
}
