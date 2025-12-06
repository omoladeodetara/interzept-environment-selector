import { defineConfig } from 'orval';

export default defineConfig({
  lastPrice: {
    input: {
      target: './openapi.yaml',
    },
    output: {
      target: './oja/lib/api/generated.ts',
      client: 'fetch',
      mode: 'tags-split',
      schemas: './oja/lib/api/schemas',
      baseUrl: '/api',
      override: {
        mutator: {
          path: './oja/lib/api/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
});
