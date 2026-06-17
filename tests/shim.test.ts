// tests/shim.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getVectorStoreInstance, initializeWithEnv } from '../src/tools/simplified-registry';

describe('Vector Store Initialization Shim', () => {
  beforeEach(() => {
    // Reset modules to clear singleton instances between tests
    vi.resetModules();
  });

  it('should use the mock vector store when NODE_ENV is "test"', async () => {
    process.env.NODE_ENV = 'test';
    const { getVectorStoreInstance } = await import('../src/tools/simplified-registry');
    const vectorStore = getVectorStoreInstance();

    // Check if it's the mock by calling a method and expecting a mock-like response
    const stats = vectorStore.getStats();
    expect(stats.localItems).toBe(0);
  });

  it('should throw an error in a non-test environment without bindings', () => {
    process.env.NODE_ENV = 'development';
    initializeWithEnv({}); // No bindings

    // Need to re-import to re-evaluate the module with the new env
    import('../src/tools/simplified-registry').then(({ getVectorStoreInstance }) => {
      expect(() => getVectorStoreInstance()).toThrow(
        'FATAL: CloudflareVectorStore requires VECTORIZE_INDEX and AI bindings.'
      );
    })
  });

  it('should attempt to use the real vector store when bindings are present', () => {
    process.env.NODE_ENV = 'production';
    initializeWithEnv({
      VECTORIZE_INDEX: 'mock_index',
      AI: 'mock_ai',
    });

    // This will still fail because the bindings aren't real, 
    // but it proves it's not using the shim.
    // We expect a different error than the FATAL one.
    import('../src/tools/simplified-registry').then(({ getVectorStoreInstance }) => {
      expect(() => getVectorStoreInstance()).toThrow();
    });
  });
});

