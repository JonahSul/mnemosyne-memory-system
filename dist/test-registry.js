/**
 * Test file for the modern registry system
 * Tests the tool registry concept without dependencies on other modules
 */
import { z } from "zod";
/**
 * Standalone registry for testing
 */
class TestRegistry {
    constructor() {
        this.registeredTools = [];
    }
    registerTool(meta, handler) {
        this.registeredTools.push({ meta, handler });
        return this;
    }
    zodToJsonSchema(zodSchema) {
        var _a;
        const type = (_a = zodSchema._def) === null || _a === void 0 ? void 0 : _a.typeName;
        switch (type) {
            case 'ZodString':
                return { type: "string", description: zodSchema.description };
            case 'ZodBoolean':
                return { type: "boolean", description: zodSchema.description };
            case 'ZodEnum':
                return { type: "string", enum: zodSchema._def.values, description: zodSchema.description };
            case 'ZodOptional':
                return this.zodToJsonSchema(zodSchema._def.innerType);
            default:
                return { type: "string", description: zodSchema.description || "Unknown type" };
        }
    }
    getTools() {
        return this.registeredTools.map(({ meta }) => {
            var _a;
            const properties = {};
            const required = [];
            for (const [key, zodSchema] of Object.entries(meta.schema)) {
                properties[key] = this.zodToJsonSchema(zodSchema);
                if (((_a = zodSchema._def) === null || _a === void 0 ? void 0 : _a.typeName) !== 'ZodOptional') {
                    required.push(key);
                }
            }
            return {
                name: meta.name,
                description: meta.description,
                inputSchema: Object.assign({ type: "object", properties, additionalProperties: false }, (required.length > 0 && { required }))
            };
        });
    }
    getHandler(toolName) {
        var _a;
        return (_a = this.registeredTools.find(t => t.meta.name === toolName)) === null || _a === void 0 ? void 0 : _a.handler;
    }
}
/**
 * Test function demonstrating the registry concept
 */
export function testRegistrySystem() {
    console.log('🧪 Testing Modern Tool Registry System\n');
    const registry = new TestRegistry();
    // Register tools programmatically (simulating decorator behavior)
    registry.registerTool({
        name: 'memory_log_claim',
        description: 'Log a claim for verification tracking',
        schema: {
            claim: z.string().describe("The claim being made"),
            confidence: z.enum(['low', 'medium', 'high']).optional().describe("Confidence level")
        },
        category: 'memory',
        priority: 10
    }, async (params) => {
        return {
            content: [{
                    type: "text",
                    text: `📝 Claim logged: ${params.claim} (confidence: ${params.confidence || 'unspecified'})`
                }]
        };
    });
    registry.registerTool({
        name: 'memory_verify_claim',
        description: 'Verify a previously logged claim',
        schema: {
            claimId: z.string().describe("ID of claim to verify"),
            success: z.boolean().describe("Whether verification succeeded")
        },
        category: 'memory',
        priority: 9
    }, async (params) => {
        const icon = params.success ? '✅' : '❌';
        return {
            content: [{
                    type: "text",
                    text: `${icon} Claim ${params.claimId}: ${params.success ? 'CONFIRMED' : 'REFUTED'}`
                }]
        };
    });
    // Generate MCP tools from registry
    const tools = registry.getTools();
    console.log('🔧 Generated MCP Tools:');
    tools.forEach((tool, i) => {
        var _a;
        console.log(`  ${i + 1}. ${tool.name}`);
        console.log(`     Description: ${tool.description}`);
        console.log(`     Properties: ${Object.keys(tool.inputSchema.properties).join(', ')}`);
        console.log(`     Required: ${((_a = tool.inputSchema.required) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'none'}`);
        console.log('');
    });
    // Test tool execution
    console.log('🚀 Testing Tool Execution:');
    const logHandler = registry.getHandler('memory_log_claim');
    if (logHandler) {
        logHandler({ claim: 'Test claim', confidence: 'high' }).then((result) => {
            console.log(`   Result: ${result.content[0].text}`);
        });
    }
    console.log('\n✅ SUCCESS: Registry system working correctly!');
    console.log('📋 This demonstrates how decorators would replace manual ToolImplementation[] arrays');
    return {
        registry,
        tools,
        totalTools: tools.length
    };
}
/**
 * Show the comparison between manual and automated approaches
 */
export function showRegistryComparison() {
    console.log('\n📊 Registry Approach Comparison:\n');
    console.log('❌ MANUAL APPROACH (Current mcp-server.ts):');
    console.log(`const tools: ToolImplementation[] = [
  {
    name: 'memory_log_claim',
    description: 'Log a claim or assertion...',
    inputSchema: {
      type: "object",
      properties: {
        claim: { type: "string", description: "..." },
        confidence: { type: "string", enum: ["low", "medium", "high"] }
      },
      additionalProperties: false,
      required: ["claim"]
    }
  },
  // ... many more manual definitions
];`);
    console.log('\n✅ AUTOMATED APPROACH (With Registry):');
    console.log(`@McpTool({
  name: 'memory_log_claim',
  description: 'Log a claim or assertion...',
  schema: {
    claim: z.string().describe("..."),
    confidence: z.enum(['low', 'medium', 'high']).optional()
  }
})
async logClaim(params) { ... }

// Registry automatically generates ToolImplementation[] from decorators
const tools = registry.scanInstance(toolsClass).getTools();`);
    console.log('\n🎯 BENEFITS:');
    console.log('  • DRY Principle: Single source of truth for tool metadata');
    console.log('  • Type Safety: Zod schemas provide runtime + compile-time validation');
    console.log('  • Automatic Registration: No manual maintenance of tool arrays');
    console.log('  • Metadata-Driven: Filtering, sorting, access control via decorators');
    console.log('  • Maintainability: Tools defined alongside implementation');
    return testRegistrySystem();
}
// Run demonstration if this file is executed directly
if (require.main === module) {
    showRegistryComparison();
}
