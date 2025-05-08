# Development Guide

This guide provides comprehensive information for developers working with the Mnemosyne Memory System, including setup, architecture patterns, testing strategies, and deployment procedures.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ with npm/yarn
- **TypeScript** 5.0+ for type safety
- **Cloudflare Workers** account for deployment
- **Git** for version control

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/JonahSul/mnemosyne-memory-system.git
cd mnemosyne-memory-system

# Install dependencies
npm install

# Set up development environment
npm run dev

# Run tests
npm test

# Deploy to staging
npm run deploy:staging
```

### Project Structure

```
mnemosyne-memory-system/
├── src/
│   ├── modules/           # Core memory modules
│   ├── tools/            # MCP tools registry
│   ├── agent.ts          # MCP agent implementation
│   ├── memory-tool.ts    # Main memory system
│   └── multi-tier-memory.ts
├── migrations/           # Foundation rule migrations
├── docs/                # Comprehensive documentation
├── tests/               # Test suites
└── test-results/        # Autonomous test outputs
```

## 🏗️ Architecture Patterns

### Delegator Pattern

The system uses a sophisticated delegator pattern for modular architecture:

```typescript
class MnemosyneMemorySystem {
  private delegator: Delegator;
  
  constructor() {
    // Set up delegation targets
    const delegationTargets: DelegationTarget[] = [
      {
        name: 'coreMemory',
        module: new CoreMemoryManager(),
        methods: autodiscoverMethods(coreMemory)
      },
      // ... other modules
    ];
    
    this.delegator = new Delegator({
      targets: delegationTargets,
      fallbackHandler: this.handleFallback.bind(this)
    });
  }
  
  // Delegate method calls to appropriate modules
  async storeKnowledge(content: string, metadata?: Record<string, unknown>): Promise<string> {
    return this.delegator.delegate('storeKnowledge', content, metadata);
  }
}
```

### Module Interface Pattern

Each module implements a consistent interface pattern:

```typescript
export interface CoreMemoryOperations {
  logClaim(claim: string, context?: Record<string, unknown>): Promise<string>;
  verifyClaim(claimId: string, success: boolean, evidence: string): Promise<boolean>;
  getUnverifiedClaims(): MemoryEntry[];
  // ... other operations
}

export class CoreMemoryManager implements CoreMemoryOperations {
  private memories = new Map<string, MemoryEntry>();
  
  async logClaim(claim: string, context?: Record<string, unknown>): Promise<string> {
    const claimId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Implementation...
    return claimId;
  }
}
```

### MCP Tools Registry Pattern

Tools are defined using a clean registry pattern:

```typescript
interface ToolImplementation {
  name: string;
  description: string;
  schema: Record<string, z.ZodType>;
  handler: (params: any) => Promise<ToolResult>;
}

export const memoryTools: ToolImplementation[] = [
  {
    name: "memory_log_claim",
    description: "Log a claim or assertion for verification tracking",
    schema: {
      claim: z.string().describe("The exact claim being made"),
      confidence: z.enum(['low', 'medium', 'high']).optional()
    },
    handler: async (params) => {
      const memory = getMnemosyneMemoryInstance();
      const claimId = await memory.logClaim(params.claim, { confidence: params.confidence });
      return formatResponse(claimId);
    }
  }
];
```

## 🧪 Testing Strategy

### Unit Tests

Use Vitest for comprehensive unit testing:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MnemosyneMemorySystem } from '../src/memory-tool';

describe('MnemosyneMemorySystem', () => {
  let memory: MnemosyneMemorySystem;
  
  beforeEach(() => {
    memory = new MnemosyneMemorySystem();
  });
  
  it('should log claims with proper IDs', async () => {
    const claimId = await memory.logClaim('Test claim');
    expect(claimId).toMatch(/^mem_\d+_[a-z0-9]+$/);
  });
  
  it('should verify claims with evidence', async () => {
    const claimId = await memory.logClaim('Test claim');
    const result = await memory.verifyClaim(claimId, true, 'Test evidence');
    expect(result).toBe(true);
  });
});
```

### Integration Tests

Test system integration with realistic scenarios:

```typescript
describe('Memory System Integration', () => {
  it('should handle complete claim lifecycle', async () => {
    const memory = new MnemosyneMemorySystem();
    
    // Log claim
    const claimId = await memory.logClaim('System will handle 1000 requests');
    
    // Verify unverified claims exist
    const unverified = memory.getUnverifiedClaims();
    expect(unverified).toHaveLength(1);
    
    // Verify claim
    await memory.verifyClaim(claimId, true, 'Load test completed successfully');
    
    // Check verification worked
    const stillUnverified = memory.getUnverifiedClaims();
    expect(stillUnverified).toHaveLength(0);
  });
});
```

### Autonomous Testing

The system includes autonomous testing for long-term validation:

```javascript
// 8-hour autonomous test
class AutonomousTest {
  async runForgettingValidation() {
    // Phase 1: Initial Population (15 min)
    // Phase 2: Early Forgetting (1 hour) 
    // Phase 3: Mid-term Retention (3 hours)
    // Phase 4: Long-term Stability (3 hours)
    // Phase 5: Final Analysis (45 min)
  }
}
```

## 🔧 Development Workflows

### Adding New Memory Modules

1. **Create Module Interface**:
```typescript
export interface NewModuleOperations {
  operation1(param: string): Promise<Result>;
  operation2(param: number): void;
}
```

2. **Implement Module**:
```typescript
export class NewModuleManager implements NewModuleOperations {
  async operation1(param: string): Promise<Result> {
    // Implementation
  }
}
```

3. **Register with Delegator**:
```typescript
// In MnemosyneMemorySystem constructor
const newModule = new NewModuleManager();
delegationTargets.push({
  name: 'newModule',
  module: newModule,
  methods: autodiscoverMethods(newModule)
});
```

### Adding New MCP Tools

1. **Define Tool Schema**:
```typescript
{
  name: "memory_new_operation",
  description: "Description of what this tool does",
  schema: {
    param1: z.string().describe("Parameter description"),
    param2: z.number().optional().describe("Optional parameter")
  },
  handler: async (params) => {
    // Tool implementation
    return formatResponse(result);
  }
}
```

2. **Add to Registry**:
```typescript
export const memoryTools: ToolImplementation[] = [
  // ... existing tools
  newTool
];
```

### Error Handling Patterns

Always use proper error handling with custom error types:

```typescript
import { MemoryNotFoundError } from '../modules/core-memory';

try {
  const result = await memory.operation(params);
  return successResponse(result);
} catch (error) {
  if (error instanceof MemoryNotFoundError) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true
    };
  }
  throw error; // Re-throw unexpected errors
}
```

## 🚀 Deployment

### Staging Deployment

```bash
# Deploy to staging environment
npm run deploy:staging

# Test staging deployment
curl https://mnemosyne-memory-system-stage.sprinklerblowout.workers.dev/
```

### Production Deployment

```bash
# Run pre-deployment checks
npm run test
npm run lint
npm run type-check

# Deploy to production
npm run deploy:production

# Verify deployment
npm run verify:production
```

### Environment Configuration

Set up environment-specific configurations:

```typescript
// wrangler.toml
[env.staging]
name = "mnemosyne-memory-system-stage"
compatibility_date = "2024-11-05"

[env.production]
name = "mnemosyne-memory-system"
compatibility_date = "2024-11-05"
```

## 📊 Monitoring and Debugging

### Memory System Diagnostics

```typescript
// Get comprehensive system status
const status = await memory.exportState();
console.log('Memory entries:', status.entries.length);
console.log('Active rules:', status.rules.length);
console.log('Delegation stats:', status.delegationStats);
```

### Performance Monitoring

```typescript
// Monitor memory tier utilization
const stats = multiTierMemory.getMemoryStats();
console.log('Tier utilization:', {
  short: `${stats.short.utilizationPercent}%`,
  intermediate: `${stats.intermediate.utilizationPercent}%`,
  long: `${stats.long.utilizationPercent}%`
});
```

### Debugging Tools

```typescript
// Debug delegator method routing
const availableMethods = memory.getAvailableMethods();
console.log('Available methods:', availableMethods);

// Debug forgetting curve analytics
const analytics = multiTierMemory.getForgettingCurveAnalytics();
console.log('Average retention rates:', analytics.averageRetention);
```

## 🔐 Best Practices

### Code Quality

1. **Type Safety**: Use TypeScript throughout with strict mode
2. **Error Handling**: Implement proper error types and handling
3. **Testing**: Maintain comprehensive test coverage
4. **Documentation**: Document all public APIs and complex logic

### Memory Management

1. **Tier Awareness**: Understand which tier is appropriate for different data
2. **Importance Scoring**: Use appropriate importance scores (0-1 scale)
3. **Access Patterns**: Consider how data will be accessed over time
4. **Cleanup**: Regular garbage collection for memory health

### Security

1. **Input Validation**: Validate all inputs using Zod schemas
2. **Error Messages**: Don't expose internal details in error messages
3. **Access Control**: Implement appropriate access controls for sensitive operations
4. **Logging**: Log security-relevant events appropriately

### Performance

1. **Lazy Loading**: Load modules and data only when needed
2. **Caching**: Use singleton patterns for expensive operations
3. **Batching**: Batch operations when possible
4. **Monitoring**: Track performance metrics and optimize bottlenecks

This development guide provides the foundation for contributing to the Mnemosyne Memory System while maintaining code quality, performance, and reliability standards.
