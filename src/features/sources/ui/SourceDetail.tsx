import { useSuspenseQuery } from "@apollo/client/react";
import { GetSourceDocument } from "../../../generated/graphql-operations";
import { SourceDeleteButton } from "./SourceDeleteButton";
import { SourceSyncButton } from "./SourceSyncButton";
import { useNavigate } from "@tanstack/react-router";
import { ErrorBoundary } from "@/shared/ErrorBoundary";

export function SourceDetail({ id }: { id: string }) {
  const {
    data: { source },
  } = useSuspenseQuery(GetSourceDocument, { variables: { id } });
  const navigate = useNavigate();

  return (
    <div>
      <h2>{source.name}</h2>
      <table>
        <tbody>
          <tr>
            <td>Bucket</td>
            <td>{source.s3_bucket}</td>
          </tr>
          <tr>
            <td>Endpoint</td>
            <td>{source.s3_endpoint}</td>
          </tr>
          <tr>
            <td>Region</td>
            <td>{source.s3_region}</td>
          </tr>
        </tbody>
      </table>
      <ErrorBoundary>
        <SourceSyncButton
          id={id}
          initialWorkflowId={source.sync_workflow_id ?? null}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        <SourceDeleteButton
          id={id}
          onComplete={() => {
            navigate({ to: "/sources" });
          }}
        />
      </ErrorBoundary>
    </div>
  );
}
