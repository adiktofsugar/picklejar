// Database row types (match the actual DB schema)

export interface SourceRow {
  id: number;
  name: string;
  kind: string;
  s3_endpoint: string;
  s3_region: string;
  s3_bucket: string;
  s3_api_key: string;
  s3_api_key_secret: string;
}

export interface ObjectRow {
  id: number;
  key: string;
  source_id: number;
  date_created: number;
  lat: number | null;
  lng: number | null;
}

// Resolver types (id converted to string for GraphQL)

export interface SourceRowResolver extends Omit<SourceRow, "id"> {
  id: string;
}

export interface ObjectRowResolver extends Omit<ObjectRow, "id"> {
  id: string;
}
