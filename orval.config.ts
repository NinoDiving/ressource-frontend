import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: 'http://localhost:8000/openapi.json',
    output: {
      mode: 'tags-split',
      target: './src/api/endpoints',
      schemas: './src/api/model',
      client: 'react-query',
      // mock: true, // Décommentez pour générer des mocks avec MSW
    },
  },
});
