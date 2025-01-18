import { describe, it, expect, beforeEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { registerMemoryTools, memoryTools } from '../src/tools/registry.js';

describe('MCP Multi-Tier Memory Tools Integration', () => {
	let server: Server;

	beforeEach(() => {
		server = new Server(
			{
				name: 'mnemosyne-memory-system',
				version: '1.0.0'
			},
			{
				capabilities: {
					tools: {}
				}
			}
		);
		registerMemoryTools(server);
	});

	describe('Multi-Tier Memory Tools Registration', () => {
		it('should include memory_store_tiered tool in registry', () => {
			const tool = memoryTools.find(t => t.name === 'memory_store_tiered');
			expect(tool).toBeDefined();
			expect(tool?.description).toContain('multi-tier memory system');
			expect(tool?.schema).toHaveProperty('content');
			expect(tool?.schema).toHaveProperty('importance');
			expect(tool?.schema).toHaveProperty('targetTier');
		});

		it('should include memory_search_tiered tool in registry', () => {
			const tool = memoryTools.find(t => t.name === 'memory_search_tiered');
			expect(tool).toBeDefined();
			expect(tool?.description).toContain('across all memory tiers');
			expect(tool?.schema).toHaveProperty('query');
			expect(tool?.schema).toHaveProperty('tierPreference');
		});

		it('should include memory_stats_tiered tool in registry', () => {
			const tool = memoryTools.find(t => t.name === 'memory_stats_tiered');
			expect(tool).toBeDefined();
			expect(tool?.description).toContain('memory statistics');
		});

		it('should execute memory_store_tiered tool', async () => {
			const tool = memoryTools.find(t => t.name === 'memory_store_tiered');
			expect(tool).toBeDefined();

			const result = await tool!.handler({
				content: 'Test knowledge for tiered storage',
				importance: 0.8,
				tags: ['test', 'integration']
			});

			expect(result.content).toBeDefined();
			expect(result.content[0].text).toContain('long tier');
			expect(result.isError).toBeFalsy();
		});

		it('should execute memory_search_tiered tool', async () => {
			const storeTool = memoryTools.find(t => t.name === 'memory_store_tiered');
			const searchTool = memoryTools.find(t => t.name === 'memory_search_tiered');
			expect(storeTool).toBeDefined();
			expect(searchTool).toBeDefined();

			// Store some test knowledge
			await storeTool!.handler({
				content: 'JavaScript programming concepts',
				importance: 0.5
			});

			// Search for it
			const searchResult = await searchTool!.handler({
				query: 'JavaScript programming',
				limit: 5
			});

			expect(searchResult.content).toBeDefined();
			expect(searchResult.content[0].text).toContain('Found');
			expect(searchResult.content[0].text).toContain('JavaScript programming');
			expect(searchResult.isError).toBeFalsy();
		});

		it('should execute memory_stats_tiered tool', async () => {
			const tool = memoryTools.find(t => t.name === 'memory_stats_tiered');
			expect(tool).toBeDefined();

			const result = await tool!.handler({});

			expect(result.content).toBeDefined();
			expect(result.content[0].text).toContain('MULTI-TIER MEMORY STATISTICS');
			expect(result.content[0].text).toContain('SHORT-TERM MEMORY');
			expect(result.content[0].text).toContain('INTERMEDIATE-TERM MEMORY');
			expect(result.content[0].text).toContain('LONG-TERM MEMORY');
			expect(result.isError).toBeFalsy();
		});
	});
});
