import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@mnemosyne/core': path.resolve(__dirname, 'packages/mnemosyne-core/src/index.ts'),
      '@mnemosyne/pubsub': path.resolve(__dirname, 'packages/mnemosyne-pubsub/src/index.ts'),
      '@mnemosyne/infra-cloudflare': path.resolve(__dirname, 'packages/mnemosyne-infrastructure-cloudflare/src/index.ts'),
      '@mnemosyne/infra-sqlite': path.resolve(__dirname, 'packages/mnemosyne-infrastructure-sqlite/src/index.ts'),
      '@mnemosyne/mcp-server': path.resolve(__dirname, 'packages/mnemosyne-mcp-server/src/index.ts'),
      '@mnemosyne/streaming': path.resolve(__dirname, 'packages/mnemosyne-streaming/src/index.ts'),
      '@mnemosyne/saas': path.resolve(__dirname, 'packages/mnemosyne-saas/src/index.ts'),
      '@mnemosyne/cli': path.resolve(__dirname, 'packages/mnemosyne-cli/src/index.ts'),
    }
  },
  test: {
    reporters: ['default'],
    testTimeout: 10000, // 10s baseline timeout
    hookTimeout: 5000,  // 5s hook timeout
    pool: 'forks',
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test'
    },
    coverage: {
      enabled: false,
    },
  }
});
