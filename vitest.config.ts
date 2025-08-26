import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable timing measurement for performance regression testing
    reporters: ['default'],
    outputFile: './test-results/performance-timing.txt',
    
    // Set performance baselines and thresholds
    testTimeout: 10000, // 10s baseline timeout
    hookTimeout: 5000,  // 5s hook timeout
    
    // Enable detailed timing in test output
    pool: 'forks',
    globals: true,
    environment: 'node',
    
    // Environment configuration for testing
    env: {
      NODE_ENV: 'test'
    },
    
    // Performance regression detection configuration
    coverage: {
      enabled: false, // Disabled to focus on timing performance
    },
    
    // Custom setup for performance timing
    setupFiles: ['./tests/setup/performance-timing.ts']
  }
});
