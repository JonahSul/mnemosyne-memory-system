/**
 * Memory tool factory — wires concrete tools to the application services.
 *
 * This is the composition point: it takes the `MemoryToolContext` (bound to
 * the `@mnemosyne/core` use cases) and returns a fully-registered `ToolRegistry`
 * containing all 7 memory tools.
 */

import type { ToolRegistry } from '../tool-registry-impl.js';
import type { MemoryToolContext } from './context.js';
import { MemoryInitTool } from './memory-init.js';
import { MemoryStoreTool } from './memory-store.js';
import { MemorySearchTool } from './memory-search.js';
import { MemoryStatsTool } from './memory-stats.js';
import { MemoryAdminTool } from './memory-admin.js';
import { MemoryStoreEnhancedTool } from './memory-store-enhanced.js';
import { MemoryAnalyzeCausalityTool } from './memory-analyze-causality.js';

export * from './context.js';

/** Register all 7 memory tools onto the provided registry. */
export function registerMemoryTools(registry: ToolRegistry, ctx: MemoryToolContext): ToolRegistry {
    registry.register(new MemoryInitTool(ctx));
    registry.register(new MemoryStoreTool(ctx));
    registry.register(new MemorySearchTool(ctx));
    registry.register(new MemoryStatsTool(ctx));
    registry.register(new MemoryAdminTool(ctx));
    registry.register(new MemoryStoreEnhancedTool(ctx));
    registry.register(new MemoryAnalyzeCausalityTool(ctx));
    return registry;
}
