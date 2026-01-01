import { useSuspenseQuery } from "@apollo/client/react";
import { GetSourceDocument } from "../../../generated/graphql-operations";

export function SourceDetail({ id }: { id: string }) {
  const {
    data: { source },
  } = useSuspenseQuery(GetSourceDocument, { variables: { id } });
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
    </div>
  );
}
