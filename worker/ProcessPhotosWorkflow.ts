import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { createDb } from "./db";
import { AwsClient } from "aws4fetch";
import ExifReader from "exifreader";
import { DOMParser, onErrorStopParsing } from "@xmldom/xmldom";

type Params = {
  sourceId: number;
  batchSize?: number;
};

const DEFAULT_BATCH_SIZE = 20;
const EXIF_HEADER_SIZE = 131072; // 128KB - enough for EXIF data

export class ProcessPhotosWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const sourceId = event.payload.sourceId;
    const batchSize = event.payload.batchSize ?? DEFAULT_BATCH_SIZE;

    console.log("[ProcessPhotosWorkflow] Starting workflow", {
      sourceId,
      batchSize,
    });

    const db = createDb(this.env.db);

    // Step 1: Get source credentials
    const source = await step.do("get source from db", async () => {
      console.log("[ProcessPhotosWorkflow] Fetching source from DB", {
        sourceId,
      });
      return db
        .selectFrom("sources")
        .selectAll()
        .where("id", "=", sourceId)
        .executeTakeFirstOrThrow();
    });

    // Step 2: Get unprocessed objects (those without photo records)
    const unprocessedObjects = await step.do(
      "get unprocessed objects",
      async () => {
        console.log("[ProcessPhotosWorkflow] Fetching unprocessed objects");
        return db
          .selectFrom("objects as o")
          .leftJoin("photos as p", "o.id", "p.object_id")
          .select(["o.id", "o.key"])
          .where("o.source_id", "=", sourceId)
          .where("p.id", "is", null)
          .limit(batchSize)
          .execute();
      },
    );

    console.log("[ProcessPhotosWorkflow] Found unprocessed objects", {
      count: unprocessedObjects.length,
    });

    if (unprocessedObjects.length === 0) {
      console.log("[ProcessPhotosWorkflow] No unprocessed objects, done");
      return;
    }

    // Step 3: Process each object and extract metadata
    type PhotoMetadata = {
      objectId: number;
      width: number | null;
      height: number | null;
      lat: number | null;
      lng: number | null;
      dateTaken: number | null;
      error: string | null;
    };

    const results = await step.do("process photos", async () => {
      const aws = new AwsClient({
        accessKeyId: source.s3_api_key,
        secretAccessKey: source.s3_api_key_secret,
        region: source.s3_region,
        service: "s3",
      });

      const metadata: PhotoMetadata[] = [];

      for (const obj of unprocessedObjects) {
        console.log("[ProcessPhotosWorkflow] Processing", { key: obj.key });

        try {
          const url = `https://${source.s3_endpoint}/${source.s3_bucket}/${obj.key}`;
          const response = await aws.fetch(url, {
            headers: { Range: `bytes=0-${EXIF_HEADER_SIZE - 1}` },
          });

          if (!response.ok) {
            metadata.push({
              objectId: obj.id,
              width: null,
              height: null,
              lat: null,
              lng: null,
              dateTaken: null,
              error: `S3 fetch failed: ${response.status}`,
            });
            continue;
          }

          const buffer = await response.arrayBuffer();
          const extracted = extractMetadata(buffer);

          metadata.push({
            objectId: obj.id,
            ...extracted,
          });
        } catch (e) {
          console.error("[ProcessPhotosWorkflow] Error processing", {
            key: obj.key,
            error: e,
          });
          metadata.push({
            objectId: obj.id,
            width: null,
            height: null,
            lat: null,
            lng: null,
            dateTaken: null,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }

      return metadata;
    });

    // Step 4: Batch insert photos using D1 batch API
    await step.do("insert photos", async () => {
      if (results.length === 0) return;

      console.log("[ProcessPhotosWorkflow] Inserting photos", {
        count: results.length,
      });

      const statements = results.map((r) =>
        this.env.db
          .prepare(
            `INSERT INTO photos (object_id, width, height, lat, lng, date_taken, processing_error)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            r.objectId,
            r.width,
            r.height,
            r.lat,
            r.lng,
            r.dateTaken,
            r.error,
          ),
      );

      try {
        await this.env.db.batch(statements);
        console.log("[ProcessPhotosWorkflow] Photos inserted successfully");
      } catch (e) {
        console.error(`[ProcessPhotosWorkflow] Failed to insert photos: ${e}`);
        if (e instanceof Error && e.stack) {
          console.error(e.stack);
        }
        throw e;
      }
    });

    // Step 5: Check if more objects need processing and re-trigger if so
    const hasMore = await step.do("check for more", async () => {
      const remaining = await db
        .selectFrom("objects as o")
        .leftJoin("photos as p", "o.id", "p.object_id")
        .select(({ fn }) => fn.countAll<number>().as("count"))
        .where("o.source_id", "=", sourceId)
        .where("p.id", "is", null)
        .executeTakeFirst();

      return (remaining?.count ?? 0) > 0;
    });

    if (hasMore) {
      console.log(
        "[ProcessPhotosWorkflow] More objects to process, re-triggering",
      );
      await this.env.ProcessPhotosWorkflow.create({
        params: { sourceId, batchSize },
      });
    } else {
      console.log("[ProcessPhotosWorkflow] All objects processed, done");
    }
  }
}

function extractMetadata(buffer: ArrayBuffer): {
  width: number | null;
  height: number | null;
  lat: number | null;
  lng: number | null;
  dateTaken: number | null;
  error: string | null;
} {
  try {
    const tags = ExifReader.load(buffer, {
      domParser: new DOMParser({ onError: onErrorStopParsing }),
    });

    const width =
      (tags["Image Width"]?.value as number) ??
      (tags["PixelXDimension"]?.value as number) ??
      null;
    const height =
      (tags["Image Height"]?.value as number) ??
      (tags["PixelYDimension"]?.value as number) ??
      null;

    const lat = parseGPS(
      tags["GPSLatitude"]?.value,
      tags["GPSLatitudeRef"]?.value,
    );
    const lng = parseGPS(
      tags["GPSLongitude"]?.value,
      tags["GPSLongitudeRef"]?.value,
    );

    const dateTaken = parseExifDate(tags["DateTimeOriginal"]?.description);

    return { width, height, lat, lng, dateTaken, error: null };
  } catch (e) {
    return {
      width: null,
      height: null,
      lat: null,
      lng: null,
      dateTaken: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function parseGPS(coords: unknown, ref: unknown): number | null {
  if (!coords || !Array.isArray(coords) || coords.length < 3) {
    return null;
  }

  // GPS coordinates are stored as [degrees, minutes, seconds]
  const degrees = Number(coords[0]);
  const minutes = Number(coords[1]);
  const seconds = Number(coords[2]);

  if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
    return null;
  }

  let decimal = degrees + minutes / 60 + seconds / 3600;

  // South and West are negative
  if (ref === "S" || ref === "W") {
    decimal = -decimal;
  }

  return decimal;
}

function parseExifDate(dateStr: unknown): number | null {
  if (typeof dateStr !== "string") {
    return null;
  }

  // EXIF dates are formatted as "YYYY:MM:DD HH:MM:SS"
  const match = dateStr.match(
    /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
  );
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  return Math.floor(date.getTime() / 1000);
}
