import { createFileRoute, Navigate } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@apollo/client/react";
import { CreateSourceDocument } from "../generated/graphql";
import { GenericError } from "../shared/GenericError";

export const Route = createFileRoute("/sources/new")({
  component: SourceNew,
});

type Inputs = {
  name: string;
  s3Endpoint: string;
  s3Region: string;
  s3Bucket: string;
  s3ApiKey: string;
  s3ApiKeySecret: string;
};

function SourceNew() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const [createSource, { called, error, loading, reset }] =
    useMutation(CreateSourceDocument);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    createSource({
      variables: {
        input: {
          name: data.name,
          s3_api_key: data.s3ApiKey,
          s3_api_key_secret: data.s3ApiKeySecret,
          s3_bucket: data.s3Bucket,
          s3_endpoint: data.s3Endpoint,
          s3_region: data.s3Region,
        },
      },
    });
  };

  if (called && error) {
    return (
      <div>
        <GenericError message={error.message} />
        <div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              reset();
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (called) {
    return <Navigate to="/sources" />;
  }

  return (
    <div>
      <h2>Create new S3 source</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <label>
            Name
            <input
              placeholder="e.g. main"
              {...register("name", { required: true })}
            />
          </label>
          {errors.s3Endpoint && <GenericError message="name is required" />}
          <label>
            S3 endpoint
            <input
              placeholder="e.g. s3.us-west-004.backblazeb2.com"
              {...register("s3Endpoint", { required: true })}
            />
          </label>
          {errors.s3Endpoint && (
            <GenericError message="s3 endpoint is required" />
          )}
          <label>
            S3 region
            <input
              placeholder="e.g. us-west-004"
              {...register("s3Region", { required: true })}
            />
          </label>
          {errors.s3Region && <GenericError message="s3 region is required" />}
          <label>
            S3 bucket name
            <input
              placeholder="e.g. picklejar-photos"
              {...register("s3Bucket", { required: true })}
            />
          </label>
          {errors.s3Bucket && <GenericError message="s3 bucket is required" />}
          <label>
            API Key
            <input {...register("s3ApiKey", { required: true })} />
            <small>Needs to have read and write access to the bucket</small>
          </label>
          {errors.s3ApiKey && <GenericError message="s3 bucket is required" />}
          <label>
            API Key Secret
            <input {...register("s3ApiKeySecret", { required: true })} />
          </label>
          {errors.s3ApiKeySecret && (
            <GenericError message="s3 bucket is required" />
          )}
        </fieldset>

        <button aria-busy={loading} type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
