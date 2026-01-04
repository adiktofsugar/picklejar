import { Hono } from "hono";
import { logger } from "hono/logger";
import { AwsClient } from "aws4fetch";
import mime from "mime";
import { createGraphQLHandler } from "./graphql";
import { decryptPhotoToken } from "./crypto";

const graphqlEndpoint = "/api/graphql";

const app = new Hono<{ Bindings: Env }>();

app.use(logger());

app.get("/api/test", async (c) => {
  return c.text("Hello from hono");
});

app.on(["GET", "POST"], graphqlEndpoint, async (c) => {
  const handler = createGraphQLHandler(
    c.env.db,
    c.env.ENCRYPTION_KEY,
    graphqlEndpoint,
  );
  return handler.fetch(c.req.raw, c.env);
});

app.get("/api/photos/:token", async (c) => {
  const { token } = c.req.param();

  let payload;
  try {
    payload = await decryptPhotoToken(token, c.env.ENCRYPTION_KEY);
  } catch {
    return c.json({ error: "Invalid token" }, 400);
  }

  const url = `https://${payload.s3Endpoint}/${payload.s3Bucket}/${payload.key}`;

  const aws = new AwsClient({
    accessKeyId: payload.s3ApiKey,
    secretAccessKey: payload.s3ApiKeySecret,
    region: payload.s3Region,
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
      "Content-Type": mime.getType(payload.key) || "application/octet-stream",
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
