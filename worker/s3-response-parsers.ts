import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export type S3Object = {
  Key: string;
  LastModified: string;
  ETag: string;
  Size: number;
  StorageClass: string;
  Owner?: {
    DisplayName: string;
    ID: string;
  };
};

export type ListObjectsV2Result = {
  IsTruncated: boolean;
  Contents: S3Object[];
  Name: string;
  Prefix: string;
  MaxKeys: number;
  KeyCount: number;
  ContinuationToken?: string;
  NextContinuationToken?: string;
  StartAfter?: string;
  Delimiter?: string;
  EncodingType?: string;
  CommonPrefixes?: { Prefix: string }[];
};

type RawListBucketResult = {
  ListBucketResult: {
    IsTruncated: boolean | string;
    Contents?: S3Object | S3Object[];
    Name: string;
    Prefix: string;
    MaxKeys: number | string;
    KeyCount: number | string;
    ContinuationToken?: string;
    NextContinuationToken?: string;
    StartAfter?: string;
    Delimiter?: string;
    EncodingType?: string;
    CommonPrefixes?: { Prefix: string } | { Prefix: string }[];
  };
};

export function parseListObjectsV2Response(text: string): ListObjectsV2Result {
  const parsed = parser.parse(text) as RawListBucketResult;
  const result = parsed.ListBucketResult;

  // Normalize Contents to always be an array
  const contents = result.Contents
    ? Array.isArray(result.Contents)
      ? result.Contents
      : [result.Contents]
    : [];

  // Normalize CommonPrefixes to always be an array
  const commonPrefixes = result.CommonPrefixes
    ? Array.isArray(result.CommonPrefixes)
      ? result.CommonPrefixes
      : [result.CommonPrefixes]
    : undefined;

  return {
    IsTruncated: result.IsTruncated === true || result.IsTruncated === "true",
    Contents: contents.map((obj) => ({
      ...obj,
      Size: typeof obj.Size === "string" ? parseInt(obj.Size, 10) : obj.Size,
    })),
    Name: result.Name,
    Prefix: result.Prefix,
    MaxKeys:
      typeof result.MaxKeys === "string"
        ? parseInt(result.MaxKeys, 10)
        : result.MaxKeys,
    KeyCount:
      typeof result.KeyCount === "string"
        ? parseInt(result.KeyCount, 10)
        : result.KeyCount,
    ContinuationToken: result.ContinuationToken,
    NextContinuationToken: result.NextContinuationToken,
    StartAfter: result.StartAfter,
    Delimiter: result.Delimiter,
    EncodingType: result.EncodingType,
    CommonPrefixes: commonPrefixes,
  };
}

export type S3Error = {
  Code: string;
  Message: string;
  Resource?: string;
  RequestId?: string;
  HostId?: string;
  BucketName?: string;
  Key?: string;
};

type RawErrorResponse = {
  Error: S3Error;
};

export function parseErrorResponse(text: string): S3Error {
  const parsed = parser.parse(text) as RawErrorResponse;
  return parsed.Error;
}

/**
 * Parses an S3 date string (ISO 8601 format) into a JavaScript Date object.
 * S3 ListObjectsV2 returns dates like "2019-11-05T23:11:50.000Z"
 */
export function parseS3Date(dateString: string): Date {
  return new Date(dateString);
}
