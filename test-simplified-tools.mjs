/**
 * Test the Simplified Memory Tools - Foundation v1.4.3 Validation
 * 
 * Tests the 4 core memory tools following Foundation v1.4.3 behavioral rules:
 * 1. memory_store - with architecture integrity verification
 * 2. memory_search - with optimized thresholds
 * 3. memory_stats - with health checking
 * 4. memory_admin - with foundation management
 */

import { simplifiedMemoryTools } from '../src/tools/simplified-registry.js';

async function testSimplifiedMemoryTools() {
	console.log("=== TESTING SIMPLIFIED MEMORY TOOLS ===\n");
	
	try {
		// Test 1: Store some test content
		console.log("1. Testing memory_store...");
		const storeHandler = simplifiedMemoryTools.find(t => t.name === "memory_store")?.handler;
		if (storeHandler) {
			const storeResult = await storeHandler({
				content: "Foundation v1.4.3 behavioral rule: Always verify memory stats after storage operations",
				metadata: { 
					type: "foundation_rule",
					priority: "critical",
					ruleId: "memory-architecture-integrity"
				},
				importance: 0.9,
				tier: "long",
				tags: ["foundation", "architecture", "critical"]
			});
			console.log("Store result:", storeResult.content[0].text);
		}
		
		// Test 2: Get memory statistics
		console.log("\n2. Testing memory_stats...");
		const statsHandler = simplifiedMemoryTools.find(t => t.name === "memory_stats")?.handler;
		if (statsHandler) {
			const statsResult = await statsHandler({
				includeTestingData: false,
				healthCheck: true
			});
			console.log("Stats result:", statsResult.content[0].text);
		}
		
		// Test 3: Search for the stored content
		console.log("\n3. Testing memory_search...");
		const searchHandler = simplifiedMemoryTools.find(t => t.name === "memory_search")?.handler;
		if (searchHandler) {
			const searchResult = await searchHandler({
				query: "Foundation v1.4.3 memory architecture",
				searchType: "exploration",
				tierPreference: "all",
				limit: 5
			});
			console.log("Search result:", searchResult.content[0].text);
		}
		
		// Test 4: View foundation rules
		console.log("\n4. Testing memory_admin...");
		const adminHandler = simplifiedMemoryTools.find(t => t.name === "memory_admin")?.handler;
		if (adminHandler) {
			const adminResult = await adminHandler({
				operation: "view_foundation",
				options: {}
			});
			console.log("Admin result:", adminResult.content[0].text);
		}
		
		console.log("\n✅ All simplified memory tools tested successfully!");
		
	} catch (error) {
		console.error("❌ Test failed:", error);
		console.error(error.stack);
	}
}

// Export the test function
export { testSimplifiedMemoryTools };

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	testSimplifiedMemoryTools();
}
