export function SourceLoading({ message }: { message: string }) {
  return <div aria-busy="true">{message}</div>;
}
