/**
 * Performance Timing Setup for Test Suite
 * Implements performance regression testing with baseline measurements
 */

// Performance timing globals
declare global {
  var PERFORMANCE_BASELINES: Map<string, number>;
  var PERFORMANCE_CURRENT: Map<string, number>;
  var PERFORMANCE_VIOLATIONS: Array<{ test: string; expected: number; actual: number; violation: number }>;
}

// Initialize performance tracking
globalThis.PERFORMANCE_BASELINES = new Map();
globalThis.PERFORMANCE_CURRENT = new Map();  
globalThis.PERFORMANCE_VIOLATIONS = [];

// CRITICAL: Set NODE_ENV for memory system vector store initialization 
// This prevents "Production vector store initialization failed" errors
// by ensuring all memory system components use test-mode fallbacks
(globalThis as any).NODE_ENV = 'test';

// Performance baseline thresholds (in milliseconds)
const PERFORMANCE_BASELINES_CONFIG = {
  // Individual test thresholds
  'Memory System should log and track claims': 50,
  'Memory System should verify claims and update status': 75,
  'Memory System should track behavioral violations': 100,
  'Memory System should handle log_claim tool execution': 150,
  'Memory System should handle verify_claim tool execution': 200,
  
  // Suite-level thresholds
  'Memory System': 1000,
  'Multi-Tier Memory Tools': 2000,
  'Memory Consultation Integration': 1500,
  'MCP Tool Memory Integration': 1800,
  'Vector Pre-warming System': 2500,
  'Enhanced Behavioral Foundation': 1200,
  
  // Performance critical operations
  'vector analysis': 300,
  'memory consultation': 200,
  'behavioral rule evaluation': 100,
  'tier promotion calculation': 150,
  'semantic similarity computation': 250
};

// Load baselines
Object.entries(PERFORMANCE_BASELINES_CONFIG).forEach(([test, threshold]) => {
  globalThis.PERFORMANCE_BASELINES.set(test, threshold);
});

// Custom matcher for performance regression testing
interface CustomMatchers<R = unknown> {
  toMeetPerformanceBaseline(testName: string): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Performance timing utilities
export const PerformanceTiming = {
  start(testName: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      globalThis.PERFORMANCE_CURRENT.set(testName, duration);
      return duration;
    };
  },
  
  checkBaseline(testName: string, actualDuration: number): boolean {
    const baseline = globalThis.PERFORMANCE_BASELINES.get(testName);
    if (!baseline) return true; // No baseline set, pass by default
    
    const isViolation = actualDuration > baseline;
    if (isViolation) {
      globalThis.PERFORMANCE_VIOLATIONS.push({
        test: testName,
        expected: baseline,
        actual: actualDuration,
        violation: actualDuration - baseline
      });
    }
    
    return !isViolation;
  },
  
  getViolations(): Array<{ test: string; expected: number; actual: number; violation: number }> {
    return [...globalThis.PERFORMANCE_VIOLATIONS];
  },
  
  generateReport(): string {
    const violations = PerformanceTiming.getViolations();
    if (violations.length === 0) {
      return '✅ All tests meet performance baselines';
    }
    
    let report = `⚠️  Performance Regression Detected (${violations.length} violations):\n\n`;
    violations.forEach(v => {
      const percentage = ((v.actual - v.expected) / v.expected * 100).toFixed(1);
      report += `❌ ${v.test}\n`;
      report += `   Expected: ≤${v.expected}ms, Actual: ${v.actual.toFixed(1)}ms (+${percentage}%)\n`;
      report += `   Violation: +${v.violation.toFixed(1)}ms\n\n`;
    });
    
    return report;
  }
};

// Vitest setup hooks
import { beforeAll, afterAll, expect } from 'vitest';

let hasRunAfterAll = false;

beforeAll(() => {
  console.log('🔄 Performance regression testing enabled');
  console.log(`📊 Monitoring ${globalThis.PERFORMANCE_BASELINES.size} performance baselines`);
});

afterAll(() => {
  // Prevent multiple reports from different test files
  if (hasRunAfterAll) return;
  hasRunAfterAll = true;
  
  const report = PerformanceTiming.generateReport();
  console.log('\n📈 PERFORMANCE REGRESSION REPORT');
  console.log('================================');
  console.log(report);
  
  // Write detailed report to file
  if (typeof process !== 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const reportPath = path.join(process.cwd(), 'test-results', 'performance-report.txt');
      fs.writeFileSync(reportPath, report);
      console.log(`📁 Detailed report saved to: ${reportPath}`);
    } catch (error) {
      console.warn('Could not save performance report to file:', error);
    }
  }
});

// Custom performance matcher
expect.extend({
  toMeetPerformanceBaseline(duration: number, testName: string) {
    const baseline = globalThis.PERFORMANCE_BASELINES.get(testName);
    if (!baseline) {
      return {
        pass: true,
        message: () => `No performance baseline set for "${testName}"`
      };
    }
    
    const pass = duration <= baseline;
    const percentage = baseline > 0 ? ((duration - baseline) / baseline * 100).toFixed(1) : '0';
    
    return {
      pass,
      message: () => pass 
        ? `Performance within baseline: ${duration.toFixed(1)}ms ≤ ${baseline}ms`
        : `Performance regression: ${duration.toFixed(1)}ms > ${baseline}ms (+${percentage}%)`
    };
  }
});
