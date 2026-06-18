#!/usr/bin/env node
/**
 * Example usage of the Mnemosyne SQLite MCP Server
 * 
 * This demonstrates how to use the SQLite vector store directly
 * or integrate it with your application.
 */

import { SqliteVectorStore } from '@mnemosyne-core/sqlite';

async function main() {
	console.log('🧠 Mnemosyne SQLite Example\n');

	// Initialize the store
	const store = new SqliteVectorStore({
		databasePath: './example-knowledge.db',
		embeddingDimension: 768,
		useWAL: true
	});

	console.log('✅ Initialized SQLite vector store\n');

	// Store some example knowledge
	console.log('📝 Storing knowledge items...\n');

	await store.storeKnowledge({
		content: 'React is a JavaScript library for building user interfaces, developed by Facebook.',
		tags: ['react', 'frontend', 'javascript'],
		metadata: { category: 'web-development', difficulty: 'intermediate' }
	});

	await store.storeKnowledge({
		content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
		tags: ['typescript', 'javascript', 'programming'],
		metadata: { category: 'programming-languages', difficulty: 'intermediate' }
	});

	await store.storeKnowledge({
		content: 'SQLite is a C-language library that implements a small, fast, self-contained SQL database engine.',
		tags: ['sqlite', 'database', 'storage'],
		metadata: { category: 'databases', difficulty: 'beginner' }
	});

	await store.storeKnowledge({
		content: 'Model Context Protocol (MCP) is a standard for connecting AI assistants to external tools and data sources.',
		tags: ['mcp', 'ai', 'protocol'],
		metadata: { category: 'ai-integration', difficulty: 'advanced' }
	});

	console.log('✅ Stored 4 knowledge items\n');

	// Semantic search
	console.log('🔍 Semantic search: "What is a database?"');
	const semanticResults = await store.searchSimilar('What is a database?', {
		limit: 3,
		threshold: 0.1
	});

	semanticResults.forEach((result, index) => {
		console.log(`\n${index + 1}. [Similarity: ${result.similarity.toFixed(3)}]`);
		console.log(`   ${result.content}`);
		console.log(`   Tags: ${result.tags.join(', ')}`);
	});

	// Full-text search
	console.log('\n\n🔎 Full-text search: "JavaScript"');
	const ftsResults = await store.searchFullText('JavaScript', 5);

	ftsResults.forEach((result, index) => {
		console.log(`\n${index + 1}. ${result.content}`);
		console.log(`   Tags: ${result.tags.join(', ')}`);
	});

	// List all
	console.log('\n\n📋 Listing all knowledge items:');
	const allItems = await store.listAll({ limit: 10 });

	allItems.forEach((item, index) => {
		console.log(`\n${index + 1}. ID: ${item.id}`);
		console.log(`   Content: ${item.content.substring(0, 80)}...`);
		console.log(`   Tags: ${item.tags.join(', ')}`);
	});

	// Statistics
	console.log('\n\n📊 Knowledge base statistics:');
	const stats = store.getStats();
	console.log(JSON.stringify(stats, null, 2));

	// Clean up
	store.close();
	console.log('\n✅ Example completed successfully!');
}

main().catch(error => {
	console.error('❌ Error:', error);
	process.exit(1);
});
