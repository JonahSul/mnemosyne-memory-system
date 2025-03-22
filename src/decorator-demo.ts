/**
 * Decorator-based Tool Registry Demonstration
 * 
 * This file demonstrates the decorator-based tool registry system working correctly
 * and shows how it replaces manual tool definitions in the MCP server.
 */

import { z } from "zod";
import { ToolRegistryBuilder, ToolImplementation } from './modules/tool-registry';
import { MnemosyneMemorySystem } from './memory-tool';

// Simple decorator that stores metadata without TypeScript complications
function toolMetadata(metadata: any) {
	const metadataStore = new WeakMap();
	
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		metadataStore.set(descriptor.value, metadata);
		// Store metadata globally for the registry to find
		(global as any).__toolMetadata = (global as any).__toolMetadata || new Map();
		(global as any).__toolMetadata.set(`${target.constructor.name}.${propertyKey}`, metadata);
		return descriptor;
	};
}

/**
 * Example tool class showing decorator pattern working
 */
export class MemoryToolsExample {
	private memory: MnemosyneMemorySystem;

	constructor(memory: MnemosyneMemorySystem) {
		this.memory = memory;
	}

	// Using a simple metadata decorator that works with TypeScript
	@toolMetadata({
		name: 'memory_log_claim',
		description: 'Log a claim or assertion for verification tracking',
		schema: {
			claim: z.string().describe("The claim being made"),
			confidence: z.enum(['low', 'medium', 'high']).optional().describe("Confidence level"),
		},
		category: 'memory',
		priority: 10
	})
	async logClaim(params: { claim: string; confidence?: string }) {
		return {
			content: [{
				type: "text" as const,
				text: `📝 Claim logged: ${params.claim}`
			}]
		};
	}

	@toolMetadata({
		name: 'memory_verify_claim', 
		description: 'Verify a previously logged claim',
		schema: {
			claimId: z.string().describe("ID of claim to verify"),
			success: z.boolean().describe("Whether verification succeeded"),
		},
		category: 'memory',
		priority: 9
	})
	async verifyClaim(params: { claimId: string; success: boolean }) {
		const icon = params.success ? '✅' : '❌';
		return {
			content: [{
				type: "text" as const,
				text: `${icon} Claim ${params.claimId} verification: ${params.success ? 'CONFIRMED' : 'REFUTED'}`
			}]
		};
	}
}

/**
 * Registry scanner that works with the simple metadata approach
 */
export class SimpleToolRegistry {
	private tools: Array<ToolImplementation & { handler: Function }> = [];

	scanClass(toolClass: any, instance: any): this {
		const metadata = (global as any).__toolMetadata || new Map();
		const className = toolClass.name;

		// Get all methods from the class prototype
		const methodNames = Object.getOwnPropertyNames(toolClass.prototype);
		
		for (const methodName of methodNames) {
			if (methodName === 'constructor') continue;
			
			const metadataKey = `${className}.${methodName}`;
			const toolMetadata = metadata.get(metadataKey);
			
			if (!toolMetadata) continue;

			// Convert to MCP format
			const properties: Record<string, any> = {};
			const required: string[] = [];

			for (const [key, zodSchema] of Object.entries(toolMetadata.schema || {})) {
				properties[key] = this.zodToJsonSchema(zodSchema as any);
				if (!(zodSchema as any)._def?.typeName?.includes('Optional')) {
					required.push(key);
				}
			}

			const tool: ToolImplementation & { handler: Function } = {
				name: toolMetadata.name,
				description: toolMetadata.description,
				inputSchema: {
					type: "object",
					properties,
					additionalProperties: false,
					...(required.length > 0 && { required })
				},
				handler: instance[methodName].bind(instance)
			};

			this.tools.push(tool);
		}

		return this;
	}

	private zodToJsonSchema(zodSchema: any): any {
		if (zodSchema._def?.typeName === 'ZodString') {
			return { type: "string", description: zodSchema.description };
		} else if (zodSchema._def?.typeName === 'ZodBoolean') {
			return { type: "boolean", description: zodSchema.description };
		} else if (zodSchema._def?.typeName === 'ZodEnum') {
			return { type: "string", enum: zodSchema._def.values, description: zodSchema.description };
		} else if (zodSchema._def?.typeName === 'ZodOptional') {
			return this.zodToJsonSchema(zodSchema._def.innerType);
		}
		return { type: "string", description: zodSchema.description || "Unknown type" };
	}

	getTools(): ToolImplementation[] {
		return this.tools.map(({ handler, ...tool }) => tool);
	}

	getToolsWithHandlers() {
		return this.tools;
	}

	getHandler(toolName: string): Function | undefined {
		return this.tools.find(t => t.name === toolName)?.handler;
	}

	clear(): this {
		this.tools = [];
		return this;
	}
}

/**
 * Demonstration of the full decorator workflow
 */
export function demonstrateDecoratorRegistry() {
	console.log('🔧 Setting up decorator-based tool registry...\n');

	// 1. Create memory system and tool class
	const memory = new MnemosyneMemorySystem();
	const toolsInstance = new MemoryToolsExample(memory);

	// 2. Scan decorated methods
	const registry = new SimpleToolRegistry();
	registry.scanClass(MemoryToolsExample, toolsInstance);

	// 3. Get tools in MCP format (replaces manual ToolImplementation[] arrays)
	const tools = registry.getTools();
	
	console.log('📋 Auto-generated tools from decorators:');
	tools.forEach((tool, index) => {
		console.log(`  ${index + 1}. ${tool.name}`);
		console.log(`     Description: ${tool.description}`);
		console.log(`     Properties: ${Object.keys(tool.inputSchema.properties).join(', ')}`);
		console.log('');
	});

	// 4. Test tool execution
	console.log('🚀 Testing tool execution:');
	
	const logHandler = registry.getHandler('memory_log_claim');
	if (logHandler) {
		const result = logHandler({ claim: 'Test claim', confidence: 'high' });
		result.then((res: any) => {
			console.log(`   Result: ${res.content[0].text}\n`);
		});
	}

	// 5. Show comparison with manual approach
	console.log('📊 Comparison:');
	console.log('   MANUAL APPROACH: Define each tool individually in ToolImplementation[]');
	console.log('   DECORATOR APPROACH: Automatically scan @toolMetadata decorators');
	console.log('   ✅ BENEFITS: DRY principle, type safety, automatic registration, metadata-driven filtering');

	return {
		tools,
		registry,
		toolsInstance
	};
}

// Example of how this would integrate with existing MCP server
export function replaceManualRegistry() {
	console.log('\n🔄 Registry Replacement Demo:');
	console.log('BEFORE: Manual tool definitions in mcp-server.ts');
	console.log(`
const tools: ToolImplementation[] = [
  {
    name: 'memory_log_claim',
    description: '...',
    inputSchema: { /* manual schema */ }
  }
  // ... many more manual definitions
];`);

	console.log('\nAFTER: Decorator-based automatic registration');
	console.log(`
const memory = new MnemosyneMemorySystem();
const toolsInstance = new MemoryToolsExample(memory);
const registry = new SimpleToolRegistry().scanClass(MemoryToolsExample, toolsInstance);
const tools = registry.getTools(); // Automatically generated!
`);

	return demonstrateDecoratorRegistry();
}

// Integration helper for existing MCP server
export function createIntegratedRegistry(memory: MnemosyneMemorySystem) {
	const toolsInstance = new MemoryToolsExample(memory);
	const registry = new SimpleToolRegistry();
	registry.scanClass(MemoryToolsExample, toolsInstance);
	return registry;
}
