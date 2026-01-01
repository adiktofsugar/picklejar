import { createFileRoute } from "@tanstack/react-router";
import { GetSourceDocument } from "../generated/graphql";

export const Route = createFileRoute("/sources/$id")({
  async loader({ params: { id }, context: { client } }) {
    const { data, error } = await client.query({
      query: GetSourceDocument,
      variables: { id },
    });
    if (error) {
      throw error;
    }
    return data!;
  },
  component: SourceDetail,
});

function SourceDetail() {
  const { source } = Route.useLoaderData();
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
