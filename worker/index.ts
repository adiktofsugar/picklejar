import { Hono } from "hono";
import { logger } from "hono/logger";
import { AwsClient } from "aws4fetch";
import mime from "mime";
import { createGraphQLHandler } from "./graphql";
import type { SourceRow } from "./db-types";

const graphqlEndpoint = "/api/graphql";

// In-memory cache for source data to avoid repeated DB queries during batch requests
interface CachedSource {
  source: SourceRow;
  expiresAt: number;
}

const sourceCache = new Map<string, CachedSource>();
const SOURCE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getSourceById(
  db: D1Database,
  sourceId: string,
): Promise<SourceRow | null> {
  const now = Date.now();
  const cached = sourceCache.get(sourceId);

  if (cached && cached.expiresAt > now) {
    return cached.source;
  }

  const source = await db
    .prepare("SELECT * FROM sources WHERE id = ?")
    .bind(sourceId)
    .first<SourceRow>();

  if (source) {
    sourceCache.set(sourceId, {
      source,
      expiresAt: now + SOURCE_CACHE_TTL_MS,
    });
  }

  return source;
}

const app = new Hono<{ Bindings: Env }>();

app.use(logger());

app.get("/api/test", async (c) => {
  return c.text("Hello from hono");
});

app.on(["GET", "POST"], graphqlEndpoint, async (c) => {
  const handler = createGraphQLHandler(c.env.db, graphqlEndpoint);
  return handler.fetch(c.req.raw, c.env);
});

app.get("/api/photos/:source_id/:key{.+}", async (c) => {
  const { source_id, key } = c.req.param();

  const source = await getSourceById(c.env.db, source_id);

  if (!source) {
    return c.json({ error: "Source not found" }, 404);
  }

  if (source.kind !== "s3") {
    return c.json({ error: "Unsupported source type" }, 400);
  }

  const url = `https://${source.s3_endpoint}/${source.s3_bucket}/${key}`;

  const aws = new AwsClient({
    accessKeyId: source.s3_api_key,
    secretAccessKey: source.s3_api_key_secret,
    region: source.s3_region,
    service: "s3",
  });

  const s3Response = await aws.fetch(url);

  if (!s3Response.ok) {
    return c.json(
      { error: "Failed to fetch image" },
      s3Response.status as 400 | 404 | 500,
    );
  }

  return c.body(s3Response.body!, {
    headers: {
      "Content-Type": mime.getType(key) || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000",
    },
  });
});

// TODO: this will likely be a specific source in the end
app.all("/s3/:s3Path{.+}", async (c) => {
  const { s3Path } = c.req.param();
  // const prefix = c.env.S3_BUCKET_PREFIX || '';
  const prefix = ""; // TODO: handle in source
  const url = `https://${c.env.S3_BUCKET_ENDPOINT}/${prefix}${s3Path}`;

  const aws = new AwsClient({
    accessKeyId: c.env.S3_API_KEY,
    secretAccessKey: c.env.S3_API_KEY_SECRET,
    region: c.env.S3_BUCKET_REGION,
    service: "s3",
  });

  return aws.fetch(url, {
    method: c.req.method,
    body: c.req.raw.body,
  });
});

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;

// const yoga = createYoga<Env>({
//   schema: createSchema({ typeDefs, resolvers }),
//   graphqlEndpoint,
//   logging: "debug",
//   fetchAPI: { Response },
// });

// export default {
//   async fetch(req, env) {
//     return yoga.fetch(req, env);
//   },
// } satisfies ExportedHandler<Env>;
