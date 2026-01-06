/**
 * This file exists because the type generator can only be configured so much
 */
import { Selectable } from "kysely";
import { Objects, Photos, Sources, DB as BaseDB } from "./generated/db-types";

export interface S3SourceRow extends Sources {
  kind: "S3";
  s3_endpoint: string;
  s3_region: string;
  s3_bucket: string;
  s3_api_key: string;
  s3_api_key_secret: string;
}
export type SourceRow = S3SourceRow;

export type S3ObjectRow = Objects;
export type ObjectRow = S3ObjectRow;

export type PhotoRow = Photos;

export interface DB extends BaseDB {
  objects: ObjectRow;
  photos: PhotoRow;
  sources: SourceRow;
}

// I need the Selectable wrapper for the custom types that the resolvers _actually_ return
export type SelectableS3SourceRow = Selectable<S3SourceRow>;
export type PhotoConnectionRaw = {
  results: Array<
    Selectable<ObjectRow> &
      Selectable<SourceRow> &
      Pick<PhotoRow, "lat" | "lng"> & { object_id: number }
  >;
  hasNextPage: boolean;
};
