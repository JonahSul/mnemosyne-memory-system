/**
 * memory_admin tool — foundation administration operations.
 *
 * Replaces the `memory_admin` handler from `simplified-registry.ts:718`.
 * Delegates to the AdministerFoundationUseCase from `@mnemosyne/core`.
 */

import { z } from 'zod';
import type { MCPTool, MCPToolResult } from '../tool-registry.js';
import type { MemoryToolContext } from './context.js';
import { errorResult, textResult } from './format.js';

const OPERATIONS = ['view_foundation', 'export_state', 'backfill', 'sanity_check', 'reset_foundation'] as const;

export class MemoryAdminTool implements MCPTool {
    readonly name = 'memory_admin';
    readonly description =
        '⚙️ **Foundation Administration** - Perform administrative operations on the memory system including viewing the foundation, exporting state, backfilling, sanity checks, and resetting the foundation.';

    readonly parameters = {
        operation: z.enum(OPERATIONS).describe('The admin operation to perform'),
    };

    constructor(private readonly ctx: MemoryToolContext) { }

    async execute(params: Record<string, unknown>): Promise<MCPToolResult> {
        try {
            const operation = params.operation as (typeof OPERATIONS)[number] | undefined;
            if (!operation) {
                return textResult(`Error: operation is required. Valid operations: ${OPERATIONS.join(', ')}`);
            }

            const output = await this.ctx.administerFoundation.execute({
                operation,
                shardKey: this.ctx.shardKey,
            });

            return textResult(
                `${output.success ? '✅' : '⚠️'} ${output.message}\n` +
                `Operation: ${output.operation}\n` +
                `Success: ${output.success}\n` +
                (Object.keys(output.data).length > 0 ? `Data: ${JSON.stringify(output.data, null, 2)}` : '')
            );
        } catch (error) {
            return errorResult(error, 'Admin operation failed');
        }
    }
}
