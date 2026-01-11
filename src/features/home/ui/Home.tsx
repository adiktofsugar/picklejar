import { ErrorBoundary } from "@/shared/ErrorBoundary";
import { Suspense } from "react";
import { PhotosList } from "./PhotosList";

export function Home() {
  return (
    <>
      <hgroup>
        <h1>Pickle Jar</h1>
        <p>Photos and more! (eventually)</p>
      </hgroup>
      <ErrorBoundary>
        <Suspense fallback={<div aria-busy="true">Loading...</div>}>
          <PhotosList />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
