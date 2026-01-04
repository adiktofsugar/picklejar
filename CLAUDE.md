# Picklejar

React + Vite frontend with Cloudflare Worker backend. Uses GraphQL with codegen.

- `src/` - React frontend (TanStack Router, Apollo Client, [Feature-Sliced Design](https://feature-sliced.design/), [Pico CSS](https://picocss.com/))
  - Layers: `app/`, `features/`, `shared/` | Slices: e.g. `features/sources/` | Segments: `ui/`, `graphql/`
  - `src/generated/` - Generated GraphQL types and operations
- `worker/` - Cloudflare Worker backend with GraphQL Yoga resolvers
- `schema.graphqls` - GraphQL schema (source of truth)
- `migrations/` - D1 database migrations

## Commands

- `npm run dev`: dev server - if running, will also generate types
- `npm run lint`: lint code - run after changes
- `npm run fix`: auto-fix code - mostly for formatting
- `npm run types`: create generated assets, like GraphQL code and route tree
