import { Hono, type Context } from 'hono';
import { AwsClient } from 'aws4fetch';

const app = new Hono<{ Bindings: Env }>();

app.get('/api/test', async (c) => {
    return c.text("Hello from hono");
})

app.all('/s3/', async (c) => {
    return fetchS3(c, '');
})

app.all('/s3/:s3Path{.+}', async (c) => {
    const { s3Path } = c.req.param();
    return fetchS3(c, s3Path);
})

function fetchS3(c: Context<{ Bindings: Env }>, pathname: string) {
    const prefix = c.env.S3_BUCKET_PREFIX || '';
    const url = `https://${c.env.S3_BUCKET_ENDPOINT}/${prefix}${pathname}`;

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
}


export default {
    fetch: app.fetch
} satisfies ExportedHandler<Env>;