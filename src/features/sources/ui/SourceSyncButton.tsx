import {
  SyncSourceDocument,
  GetSyncStatusDocument,
  SyncStatusState,
} from "@/generated/graphql-operations";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

type Props = {
  id: string;
  initialWorkflowId: string | null;
};

export function SourceSyncButton({ id, initialWorkflowId }: Props) {
  const [workflowId, setWorkflowId] = useState<string | null>(
    initialWorkflowId,
  );

  const [syncSource, { loading: mutationLoading, error: mutationError }] =
    useMutation(SyncSourceDocument, {
      variables: { input: { id } },
      onCompleted: (data) => {
        setWorkflowId(data.syncSource);
      },
    });

  // Query for status when we have a workflow ID
  const {
    data: statusData,
    startPolling,
    stopPolling,
  } = useQuery(GetSyncStatusDocument, {
    variables: { workflowId: workflowId! },
    skip: !workflowId,
  });

  const status = statusData?.syncStatus?.status;
  const isActive = isActiveStatus(status);

  // Start/stop polling based on status
  useEffect(() => {
    if (workflowId && (isActive || !status)) {
      startPolling(2000);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [workflowId, isActive, status, startPolling, stopPolling]);

  if (mutationError) {
    throw mutationError;
  }

  return (
    <div>
      <button
        aria-busy={mutationLoading || isActive}
        disabled={mutationLoading || isActive}
        onClick={() => {
          syncSource();
        }}
      >
        {getButtonText(status, mutationLoading)}
      </button>
      {status === "errored" && statusData?.syncStatus?.error && (
        <p style={{ color: "var(--pico-color-red-500)" }}>
          Error: {statusData.syncStatus.error}
        </p>
      )}
    </div>
  );
}

function isActiveStatus(status: SyncStatusState | undefined | null): boolean {
  return (
    status === "running" ||
    status === "queued" ||
    status === "waiting" ||
    status === "waitingForPause"
  );
}

function getButtonText(
  status: SyncStatusState | undefined | null,
  loading: boolean,
): string {
  if (loading) return "Starting...";

  switch (status) {
    case "running":
    case "waiting":
      return "Syncing...";
    case "queued":
      return "Queued...";
    case "complete":
      return "Sync (Last: Complete)";
    case "errored":
      return "Sync (Last: Failed)";
    case "paused":
      return "Sync (Paused)";
    case "terminated":
      return "Sync (Terminated)";
    default:
      return "Sync";
  }
}
