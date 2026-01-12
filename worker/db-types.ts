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

// Result type for the photos query (queries from photos table, joins objects and sources)
export type PhotoConnectionResult = {
  // Photo fields (id is from photos table)
  id: number;
  width: number;
  height: number;
  lat: number | null;
  lng: number | null;
  date_taken: number | null;
  // Object fields
  object_id: number;
  key: string;
  date_created: number;
  // Source fields for token generation
  s3_endpoint: string;
  s3_region: string;
  s3_bucket: string;
  s3_api_key: string;
  s3_api_key_secret: string;
  source_id: number;
};

export type PhotoConnectionRaw = {
  results: PhotoConnectionResult[];
  hasNextPage: boolean;
  errorCount: number;
};

// Result type for the photosErrors query
export type PhotoErrorResult = {
  id: number;
  object_id: number;
  key: string;
  processing_error: string;
};

export type PhotoErrorConnectionRaw = {
  results: PhotoErrorResult[];
  hasNextPage: boolean;
};
