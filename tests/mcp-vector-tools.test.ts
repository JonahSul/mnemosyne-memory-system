/**
 * MCP Vector Tools Integration Tests
 * 
 * Tests for vector database tools that integrate with the MCP protocol
 * to provide working memory RAG capabilities through the agent interface.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { memoryTools } from '../src/tools/registry.js';

describe('MCP Vector Tools Integration', () => {
	describe('Vector Knowledge Tools', () => {
		it('should include memory_store_knowledge tool in registry', () => {
			// RED: This will fail because memory_store_knowledge doesn't exist yet
			const storeKnowledgeTool = memoryTools.find(tool => tool.name === 'memory_store_knowledge');
			
			expect(storeKnowledgeTool).toBeDefined();
			expect(storeKnowledgeTool?.description).toContain('store knowledge');
			expect(storeKnowledgeTool?.schema).toHaveProperty('content');
			expect(storeKnowledgeTool?.schema).toHaveProperty('metadata');
			expect(storeKnowledgeTool?.schema).toHaveProperty('tags');
		});

		it('should include memory_search_knowledge tool in registry', () => {
			// RED: This will fail because memory_search_knowledge doesn't exist yet  
			const searchKnowledgeTool = memoryTools.find(tool => tool.name === 'memory_search_knowledge');
			
			expect(searchKnowledgeTool).toBeDefined();
			expect(searchKnowledgeTool?.description).toContain('search knowledge');
			expect(searchKnowledgeTool?.schema).toHaveProperty('query');
			expect(searchKnowledgeTool?.schema).toHaveProperty('limit');
			expect(searchKnowledgeTool?.schema).toHaveProperty('threshold');
		});

		it('should execute memory_store_knowledge tool', async () => {
			// RED: This will fail because the tool handler doesn't exist yet
			const storeKnowledgeTool = memoryTools.find(tool => tool.name === 'memory_store_knowledge');
			
			const params = {
				content: 'React is a JavaScript library for building user interfaces',
				metadata: { type: 'web-development', framework: 'react' },
				tags: ['react', 'javascript', 'ui', 'library']
			};

			const result = await storeKnowledgeTool!.handler(params);

			expect(result.content).toHaveLength(1);
			expect(result.content[0].type).toBe('text');
			expect(result.content[0].text).toContain('Knowledge stored');
			expect(result.content[0].text).toContain('vec_');
		});

		it('should execute memory_search_knowledge tool', async () => {
			// RED: This will fail because the tool handler doesn't exist yet
			const storeKnowledgeTool = memoryTools.find(tool => tool.name === 'memory_store_knowledge');
			const searchKnowledgeTool = memoryTools.find(tool => tool.name === 'memory_search_knowledge');

			// First store some knowledge
			await storeKnowledgeTool!.handler({
				content: 'Vue.js is a progressive JavaScript framework',
				metadata: { type: 'web-development' },
				tags: ['vue', 'javascript', 'framework']
			});

			// Then search for it
			const searchParams = {
				query: 'JavaScript frameworks for web development',
				limit: 5,
				threshold: 0.1
			};

			const result = await searchKnowledgeTool!.handler(searchParams);

			expect(result.content).toHaveLength(1);
			expect(result.content[0].type).toBe('text');
			expect(result.content[0].text).toContain('Found');
			expect(result.content[0].text).toContain('knowledge items');
		});
	});
});
