import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // The tests use one real MongoDB test database. Running files sequentially
    // prevents them from clearing each other's data.
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    setupFiles: ['./tests/setupEnv.js'],
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
