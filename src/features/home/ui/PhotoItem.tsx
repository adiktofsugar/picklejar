export function PhotoItem({ token }: { token: string }) {
  return <img src={`/api/photos/${token}`} />;
}
