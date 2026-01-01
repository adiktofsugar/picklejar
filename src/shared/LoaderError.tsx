import { useRouter } from "@tanstack/react-router";
import { GenericError } from "./GenericError";

export function LoaderError({ message }: { message: string }) {
  const router = useRouter();
  return (
    <GenericError
      message={message}
      footer={
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            router.invalidate();
          }}
        >
          Retry?
        </button>
      }
    />
  );
}
