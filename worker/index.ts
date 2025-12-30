import { Hono } from 'hono';
import { AwsClient } from 'aws4fetch';
import { createGraphQLHandler } from './graphql';

const app = new Hono<{ Bindings: Env }>();

app.get('/api/test', async (c) => {
    return c.text("Hello from hono");
})

const graphqlEndpoint = '/api/graphql';
app.on(['GET', 'POST'], graphqlEndpoint, async (c) => {
    const handler = createGraphQLHandler(c.env.db, graphqlEndpoint);
    return handler.fetch(c.req.raw, c.env);
})

// TODO: this will likely be a specific source in the end
app.all('/s3/:s3Path{.+}', async (c) => {
    const { s3Path } = c.req.param();
    // const prefix = c.env.S3_BUCKET_PREFIX || '';
    const prefix = ''; // TODO: handle in source
    const url = `https://${c.env.S3_BUCKET_ENDPOINT}/${prefix}${s3Path}`;

    const aws = new AwsClient({
        accessKeyId: c.env.S3_API_KEY,
        secretAccessKey: c.env.S3_API_KEY_SECRET,
        region: c.env.S3_BUCKET_REGION,
        service: 's3',
    });

    return aws.fetch(url, {
        method: c.req.method,
        body: c.req.raw.body,
    });
})


export default {
    fetch: app.fetch
} satisfies ExportedHandler<Env>;