#!/usr/bin/env node
/**
 * Mnemosyne SQLite MCP Server
 *
 * Exposes project-local knowledge storage via Model Context Protocol (MCP)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SqliteVectorStore } from './sqlite-vector-store.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { randomUUID } from 'crypto';

// Configuration
const DEFAULT_DB_PATH = process.env.MNEMOSYNE_DB_PATH || './mnemosyne-knowledge.db';
const dbPath = resolve(DEFAULT_DB_PATH);
const UUAD_FILE = resolve(dirname(dbPath), '.mnemosyne-agent-uuad');

// UUAD Management: Check CLI args, env var, or generate/persist
function getOrCreateUUAD(): string {
	const cliArg = process.argv.find(arg => arg.startsWith('--agent-uuad='));
	if (cliArg) return cliArg.split('=')[1];
	
	if (process.env.MNEMOSYNE_AGENT_UUAD) return process.env.MNEMOSYNE_AGENT_UUAD;
	
	if (existsSync(UUAD_FILE)) {
		return readFileSync(UUAD_FILE, 'utf8').trim();
	}
	
	const newUUAD = randomUUID();
	try {
		writeFileSync(UUAD_FILE, newUUAD, 'utf8');
	} catch (e) {
		console.error('Warning: Could not persist UUAD to', UUAD_FILE);
	}
	return newUUAD;
}

const AGENT_UUAD = getOrCreateUUAD();

// Ensure database directory exists
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
	mkdirSync(dbDir, { recursive: true });
}

// Initialize the vector store
const vectorStore = new SqliteVectorStore({
	databasePath: dbPath,
	embeddingDimension: 768,
	useWAL: true
});

// Create the MCP server
const server = new Server(
	{
		name: 'mnemosyne',
		version: '1.0.0',
	},
	{
		capabilities: {
			tools: {},
		},
	}
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: 'store_knowledge',
				description: 'Store a piece of knowledge in the local knowledge base. The content will be embedded and indexed for semantic search.',
				inputSchema: {
					type: 'object',
					properties: {
						content: {
							type: 'string',
							description: 'The knowledge content to store'
						},
						tags: {
							type: 'array',
							items: { type: 'string' },
							description: 'Optional tags for categorizing the knowledge'
						},
						metadata: {
							type: 'object',
							description: 'Optional metadata (key-value pairs)'
						}
					},
					required: ['content']
				}
			},
			{
				name: 'foundation_info',
				description: '**CALL THIS FIRST.** Returns Foundation protocol v1.7.0+ requirements: strict metadata (topics, documentType, task, agent), causality tracking (precedentMemoryIds, assertionId), and imperative agent loop (search → hypothesize → execute → prove/disprove). Agents MUST follow this protocol for all memory operations.',
				inputSchema: {
					type: 'object',
					properties: {}
				}
			},
			{
				name: 'orientation_onramp',
				description: '**CALL THIS SECOND.** Returns orientation steps, known memory IDs, and recommended searches to bootstrap knowledge. Use this immediately after foundation_info to understand system context.',
				inputSchema: {
					type: 'object',
					properties: {}
				}
			},
			{
				name: 'search_knowledge',
				description: 'Search for relevant knowledge using semantic similarity. Returns the most relevant results based on the query.',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'The search query'
						},
						limit: {
							type: 'number',
							description: 'Maximum number of results to return (default: 5)',
							default: 5
						},
						threshold: {
							type: 'number',
							description: 'Minimum similarity threshold (0-1, default: 0.1)',
							default: 0.1
						}
					},
					required: ['query']
				}
			},
			{
				name: 'search_fulltext',
				description: 'Search for knowledge using full-text search (faster than semantic search, but exact keyword matching).',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'The search query (FTS5 syntax supported)'
						},
						limit: {
							type: 'number',
							description: 'Maximum number of results to return (default: 10)',
							default: 10
						}
					},
					required: ['query']
				}
			},
			{
				name: 'get_knowledge',
				description: 'Retrieve a specific knowledge item by its ID.',
				inputSchema: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description: 'The knowledge item ID'
						}
					},
					required: ['id']
				}
			},
			{
				name: 'list_knowledge',
				description: 'List all knowledge items with pagination.',
				inputSchema: {
					type: 'object',
					properties: {
						limit: {
							type: 'number',
							description: 'Maximum number of results to return (default: 100)',
							default: 100
						},
						offset: {
							type: 'number',
							description: 'Number of results to skip (default: 0)',
							default: 0
						}
					}
				}
			},
			{
				name: 'delete_knowledge',
				description: 'Delete a knowledge item by its ID.',
				inputSchema: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description: 'The knowledge item ID to delete'
						}
					},
					required: ['id']
				}
			},
			{
			name: 'get_stats',
			description: 'Get statistics about the knowledge base (total records, database size, etc.).',
			inputSchema: {
				type: 'object',
				properties: {}
			}
		},
		{
			name: 'agent_identity',
			description: 'Get or create the Universal Unique Agent Designator (UUAD) for this agent. This should be included in metadata.agent.uuid for all store_knowledge calls. Returns UUAD and usage instructions.',
			inputSchema: {
				type: 'object',
				properties: {}
			}
		}
	]
	};
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	try {
		const { name, arguments: args } = request.params;

		switch (name) {
			case 'store_knowledge': {
				const { content, tags, metadata } = args as {
					content: string;
					tags?: string[];
					metadata?: Record<string, unknown>;
				};

				const meta = (metadata || {}) as Record<string, any>;
				const protocolHints: Array<{
					code: string;
					severity: 'info' | 'warning' | 'error';
					message: string;
					suggestedTools?: string[];
				}> = [];

				try {
					const documentType = meta.documentType as string | undefined;
					const task = meta.task as { id?: string } | undefined;
					const causality = meta.causality as {
						precedentMemoryIds?: string[];
						assertionId?: string;
					} | undefined;

					if (documentType && ['HYPOTHESIS', 'DECISION', 'FACT', 'TASK_PLAN', 'RESULT'].includes(documentType.toUpperCase())) {
						if (!task || !task.id) {
							protocolHints.push({
								code: 'MISSING_TASK_ID',
								severity: 'warning',
								message: 'Protocol expects a task.id for this memory. Consider binding this write to a stable task context.',
								suggestedTools: ['foundation_info', 'orientation_onramp']
							});
						}

						if (['HYPOTHESIS', 'DECISION', 'FACT'].includes(documentType.toUpperCase())) {
							const precedent = causality?.precedentMemoryIds || [];
							if (!precedent.length) {
								protocolHints.push({
									code: 'MISSING_PRECEDENT',
									severity: 'warning',
									message: 'This assertion is not linked to prior evidence. Search memory first and set causality.precedentMemoryIds to the supporting memories.',
									suggestedTools: ['search_knowledge', 'foundation_info', 'orientation_onramp']
								});
							}
						}
					}
				} catch (hintError) {
					console.warn('protocolHints evaluation failed, continuing without hints', hintError);
				}

				// Auto-inject agent UUAD if missing
				if (!meta.agent?.uuid) {
					meta.agent = { ...meta.agent, uuid: AGENT_UUAD };
				}

			const result = await vectorStore.storeKnowledge({
				content,
				tags: tags || [],
				metadata: meta
			});

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({
							success: true,
							id: result.id,
							timestamp: result.timestamp,
							protocolHints: protocolHints.length ? protocolHints : undefined
						}, null, 2)
					}
				]
			};
		}		case 'agent_identity': {
			const isMCP = true;
			const isHTTP = false;
			const instructions = isMCP
				? 'For MCP/stdio: Include this UUAD in metadata.agent.uuid for all store_knowledge calls. Server will auto-inject if missing, but explicit inclusion is preferred.'
				: 'For HTTP: Send this UUAD via X-Agent-UUAD header or metadata.agent.uuid in request body.';
			
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({
							success: true,
							uuad: AGENT_UUAD,
							instructions,
							usage: {
								mcp: 'Include in metadata.agent.uuid',
								http: 'Send via X-Agent-UUAD header',
								cli: '--agent-uuad=<uuid>',
								env: 'MNEMOSYNE_AGENT_UUAD=<uuid>'
							},
							persistence: `UUAD persisted to ${UUAD_FILE}`
						}, null, 2)
					}
				]
			};
		}

		case 'search_knowledge': {
				const { query, limit, threshold } = args as {
					query: string;
					limit?: number;
					threshold?: number;
				};

				const results = await vectorStore.searchSimilar(query, {
					limit: limit || 5,
					threshold: threshold || 0.1
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								success: true,
								query,
								results: results.map(r => ({
									id: r.id,
									content: r.content,
									similarity: r.similarity,
									tags: r.tags,
									timestamp: r.timestamp,
									metadata: r.metadata
								}))
							}, null, 2)
						}
					]
				};
			}

			case 'search_fulltext': {
				const { query, limit } = args as {
					query: string;
					limit?: number;
				};

				const results = await vectorStore.searchFullText(query, limit || 10);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								success: true,
								query,
								results: results.map(r => ({
									id: r.id,
									content: r.content,
									tags: r.tags,
									timestamp: r.timestamp,
									metadata: r.metadata
								}))
							}, null, 2)
						}
					]
				};
			}

			case 'foundation_info': {
				try {
					const rootDir = resolve(__dirname, '../../..');
					const foundationPath = resolve(rootDir, 'FOUNDATION.md');
					let summary: string;
					let guidance: string;
					if (existsSync(foundationPath)) {
						const raw = readFileSync(foundationPath, 'utf8');
						const lines = raw.split('\n');
						const titleLine = lines.find((line) => line.startsWith('# '));
						const introLines = lines
							.filter((line) => line.startsWith('- '))
							.slice(0, 5);
						summary = [titleLine ?? 'Mnemosyne Foundation Protocol', ...introLines].join('\n');
						guidance =
							'Call `foundation_info` first, then `orientation_onramp`, then use search tools with the required metadata (topics, documentType, task, agent).';
					} else {
						summary = 'Mnemosyne Foundation protocol summary is not available on this server.';
						guidance =
							'Use this memory server with strict topic/task/document metadata and prefer semantic search over raw storage.';
					}
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										kind: 'foundation_info',
										version: '1.7.0+',
										summary,
										guidance
									},
									null,
									2
								)
							}
						]
					};
				} catch (error) {
					console.error('Error in foundation_info tool', error);
					throw error;
				}
			}

			case 'orientation_onramp': {
				try {
					const rootDir = resolve(__dirname, '../../..');
					const orientationPath = resolve(
						rootDir,
						'copilot-notes',
						'ORIENTATION_PACKAGE_INDEX.md'
					);
					let steps: string[] = [];
					let notes: string[] = [];
					if (existsSync(orientationPath)) {
						const raw = readFileSync(orientationPath, 'utf8');
						const lines = raw.split('\n');
						steps = lines
							.filter((line) => line.trim().match(/^[-*] /))
							.slice(0, 10);
						notes = lines
							.filter((line) => line.toLowerCase().includes('orientation'))
							.slice(0, 5);
					} else {
						steps = [
							'1. Read foundation_info to understand protocol expectations.',
							'2. Identify your current task and topics.',
							'3. Use search_knowledge with a concise query and metadata.',
							'4. Store new knowledge with complete metadata when appropriate.'
						];
						notes = ['Orientation index file was not found; using generic onramp.'];
					}
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										kind: 'orientation_onramp',
										steps,
										notes
									},
									null,
									2
								)
							}
						]
					};
				} catch (error) {
					console.error('Error in orientation_onramp tool', error);
					throw error;
				}
			}

			case 'get_knowledge': {
				const { id } = args as { id: string };
				const results = await vectorStore.getById(id);

				if (results.length === 0) {
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify({
									success: false,
									error: 'Knowledge item not found'
								}, null, 2)
							}
						]
					};
				}

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								success: true,
								result: results[0]
							}, null, 2)
						}
					]
				};
			}

			case 'list_knowledge': {
				const { limit, offset } = args as {
					limit?: number;
					offset?: number;
				};

				const results = await vectorStore.listAll({
					limit: limit || 100,
					offset: offset || 0
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								success: true,
								count: results.length,
								results: results.map(r => ({
									id: r.id,
									content: r.content.substring(0, 200) + (r.content.length > 200 ? '...' : ''),
									tags: r.tags,
									timestamp: r.timestamp
								}))
							}, null, 2)
						}
					]
				};
			}

			case 'delete_knowledge': {
				const { id } = args as { id: string };
				const deleted = await vectorStore.deleteById(id);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								success: deleted,
								message: deleted ? 'Knowledge item deleted' : 'Knowledge item not found'
							}, null, 2)
						}
					]
				};
			}

			case 'get_stats': {
				const stats = vectorStore.getStats();

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								success: true,
								stats
							}, null, 2)
						}
					]
				};
			}

			default:
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({
								success: false,
								error: `Unknown tool: ${name}`
							}, null, 2)
						}
					],
					isError: true
				};
		}
	} catch (error) {
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify({
						success: false,
						error: error instanceof Error ? error.message : String(error)
					}, null, 2)
				}
			],
			isError: true
		};
	}
});

// Start the server
async function main() {
	console.error('Starting Mnemosyne SQLite MCP Server...');
	console.error(`Database: ${dbPath}`);
	console.error(`Agent UUAD: ${AGENT_UUAD}`);
	console.error(`UUAD Config: CLI arg (--agent-uuad) > Env (MNEMOSYNE_AGENT_UUAD) > File (${UUAD_FILE})`);
	console.error('');
	console.error('**AGENT ONRAMP: Call agent_identity first, then foundation_info.**');
	console.error('Mnemosyne enforces strict metadata and causality tracking.');
	console.error('Perform memory operations quietly unless errors occur.');
	console.error('');
	console.error('Server ready for connections');

	const transport = new StdioServerTransport();
	await server.connect(transport);

	// Graceful shutdown
	process.on('SIGINT', () => {
		console.error('Shutting down...');
		vectorStore.close();
		process.exit(0);
	});

	process.on('SIGTERM', () => {
		console.error('Shutting down...');
		vectorStore.close();
		process.exit(0);
	});
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
