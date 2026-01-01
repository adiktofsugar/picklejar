import { useQuery } from "@apollo/client/react";
import type { ResultOf } from "@graphql-typed-document-node/core";
import { GetSourceDocument } from "../../../generated/graphql";
import { Error } from "../../../shared/Error";

export function SourceDetail({ id }: { id: string }) {
  const { data, error, loading } = useQuery(GetSourceDocument, {
    variables: { id },
  });
  if (error) {
    return <Error message={error.message} />;
  }
  if (loading) {
    return <p aria-busy="true">Loading...</p>;
  }
  if (!data) {
    return null;
  }
  return <SourceListWithData data={data} />;
}

function SourceListWithData({
  data,
}: {
  data: ResultOf<typeof GetSourceDocument>;
}) {
  const { source } = data;
  if (!source) {
    return (
      <div>
        <p>Source not found</p>
      </div>
    );
  }
  return (
    <div>
      <h2>{source.name}</h2>
      <table>
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
      </table>
    </div>
  );
}
