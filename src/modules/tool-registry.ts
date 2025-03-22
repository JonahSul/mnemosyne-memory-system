/**
 * Tool Registration System - Decorator-based Metadata Approach
 * 
 * This module provides a decorator-based system for automatically registering MCP tools
 * using metadata stored on class methods. It eliminates the need for manual tool registry
 * maintenance by scanning decorated methods and building tool definitions at runtime.
 */

import { z, ZodSchema } from "zod";

// Metadata storage using WeakMap to avoid TypeScript complications with reflect-metadata
const methodMetadata = new WeakMap<Function, ToolMetadata>();

export interface ToolMetadata {
	name: string;
	description: string;
	schema: Record<string, ZodSchema>;
	category?: string;
	priority?: number;
	access?: 'public' | 'admin' | 'system';
	deprecated?: boolean;
	deprecationMessage?: string;
	tags?: string[];
	version?: string;
}

export interface ToolImplementation {
	name: string;
	description: string;
	inputSchema: {
		type: "object";
		properties: Record<string, any>;
		additionalProperties: boolean;
		required?: string[];
	};
}

/**
 * Main decorator for marking methods as MCP tools
 */
export function McpTool(metadata: ToolMetadata): MethodDecorator {
	return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		// Store metadata for this method
		methodMetadata.set(descriptor.value, metadata);
		return descriptor;
	};
}

/**
 * Schema decorator for defining input validation (can be used with McpTool)
 */
export function Schema(schema: Record<string, ZodSchema>) {
	return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const existing = methodMetadata.get(descriptor.value) || {} as any;
		existing.schema = schema;
		methodMetadata.set(descriptor.value, existing);
		return descriptor;
	};
}

/**
 * Category decorator for organizing tools
 */
export function Category(category: string) {
	return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const existing = methodMetadata.get(descriptor.value) || {} as any;
		existing.category = category;
		methodMetadata.set(descriptor.value, existing);
		return descriptor;
	};
}

/**
 * Priority decorator for tool ordering
 */
export function Priority(priority: number) {
	return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const existing = methodMetadata.get(descriptor.value) || {} as any;
		existing.priority = priority;
		methodMetadata.set(descriptor.value, existing);
		return descriptor;
	};
}

/**
 * Access control decorator
 */
export function Access(access: 'public' | 'admin' | 'system') {
	return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const existing = methodMetadata.get(descriptor.value) || {} as any;
		existing.access = access;
		methodMetadata.set(descriptor.value, existing);
		return descriptor;
	};
}

/**
 * Deprecation decorator
 */
export function Deprecated(message?: string) {
	return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		const existing = methodMetadata.get(descriptor.value) || {} as any;
		existing.deprecated = true;
		existing.deprecationMessage = message;
		methodMetadata.set(descriptor.value, existing);
		return descriptor;
	};
}

/**
 * Convert Zod schema to JSON Schema format for MCP
 */
function zodToJsonSchema(zodSchema: ZodSchema): any {
	// Simple conversion - in practice you might want to use a library like zod-to-json-schema
	if (zodSchema instanceof z.ZodString) {
		return { type: "string", description: zodSchema.description };
	} else if (zodSchema instanceof z.ZodNumber) {
		return { type: "number", description: zodSchema.description };
	} else if (zodSchema instanceof z.ZodBoolean) {
		return { type: "boolean", description: zodSchema.description };
	} else if (zodSchema instanceof z.ZodArray) {
		return { type: "array", items: zodToJsonSchema(zodSchema.element), description: zodSchema.description };
	} else if (zodSchema instanceof z.ZodRecord) {
		return { type: "object", additionalProperties: true, description: zodSchema.description };
	} else if (zodSchema instanceof z.ZodEnum) {
		return { type: "string", enum: zodSchema.options, description: zodSchema.description };
	} else if (zodSchema instanceof z.ZodOptional) {
		return zodToJsonSchema(zodSchema.unwrap());
	}
	
	// Fallback
	return { type: "string", description: zodSchema.description || "Unknown type" };
}

/**
 * Tool Registry Builder - scans classes for decorated methods and builds tool definitions
 */
export class ToolRegistryBuilder {
	private tools: Array<ToolImplementation & { handler: Function; metadata: ToolMetadata }> = [];

	/**
	 * Scan a class instance for decorated methods and register them as tools
	 */
	scanInstance(instance: any): this {
		const prototype = Object.getPrototypeOf(instance);
		const methodNames = Object.getOwnPropertyNames(prototype);

		for (const methodName of methodNames) {
			if (methodName === 'constructor') continue;

			const method = prototype[methodName];
			if (typeof method !== 'function') continue;

			const metadata = methodMetadata.get(method);
			if (!metadata) continue;

			// Convert schema to MCP format
			const properties: Record<string, any> = {};
			const required: string[] = [];

			for (const [key, zodSchema] of Object.entries(metadata.schema)) {
				properties[key] = zodToJsonSchema(zodSchema);
				
				// Check if this field is required (not optional)
				if (!(zodSchema instanceof z.ZodOptional)) {
					required.push(key);
				}
			}

			const inputSchema: ToolImplementation['inputSchema'] = {
				type: "object",
				properties,
				additionalProperties: false
			};

			if (required.length > 0) {
				inputSchema.required = required;
			}

			const toolImpl: ToolImplementation = {
				name: metadata.name,
				description: metadata.description,
				inputSchema
			};

			this.tools.push({
				...toolImpl,
				handler: method.bind(instance),
				metadata
			});
		}

		return this;
	}

	/**
	 * Get all registered tools as ToolImplementation array
	 */
	getTools(): ToolImplementation[] {
		return this.tools.map(tool => ({
			name: tool.name,
			description: tool.description,
			inputSchema: tool.inputSchema
		}));
	}

	/**
	 * Get tools with handlers for execution
	 */
	getToolsWithHandlers(): Array<ToolImplementation & { handler: Function }> {
		return this.tools.map(tool => ({
			name: tool.name,
			description: tool.description,
			inputSchema: tool.inputSchema,
			handler: tool.handler
		}));
	}

	/**
	 * Filter tools by category
	 */
	filterByCategory(category: string): this {
		this.tools = this.tools.filter(tool => tool.metadata.category === category);
		return this;
	}

	/**
	 * Filter tools by access level
	 */
	filterByAccess(access: 'public' | 'admin' | 'system'): this {
		this.tools = this.tools.filter(tool => tool.metadata.access === access || !tool.metadata.access);
		return this;
	}

	/**
	 * Exclude deprecated tools
	 */
	excludeDeprecated(): this {
		this.tools = this.tools.filter(tool => !tool.metadata.deprecated);
		return this;
	}

	/**
	 * Sort tools by priority (higher priority first)
	 */
	sortByPriority(): this {
		this.tools.sort((a, b) => (b.metadata.priority || 0) - (a.metadata.priority || 0));
		return this;
	}

	/**
	 * Get tool handler by name
	 */
	getHandler(toolName: string): Function | undefined {
		const tool = this.tools.find(t => t.name === toolName);
		return tool?.handler;
	}

	/**
	 * Clear all registered tools
	 */
	clear(): this {
		this.tools = [];
		return this;
	}

	/**
	 * Get metadata for debugging
	 */
	getMetadata(): Array<{ name: string; metadata: ToolMetadata }> {
		return this.tools.map(tool => ({
			name: tool.name,
			metadata: tool.metadata
		}));
	}
}
