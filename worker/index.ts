import { Hono } from 'hono';

const app = new Hono();

app.get('/api/test', async (c) => {
    return c.text("Hello from hono");
})

export default {
    fetch: app.fetch
} satisfies ExportedHandler;