/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Decomposed Tool Registry
 * 
 * Elegant organization of MCP tools by functional subsystem while maintaining
 * unified registration and backward compatibility.
 */

import { MnemosyneMemorySystem } from '../memory-tool.js';
import { BehavioralMemoryTools } from './behavioral-memory-subsystem.js';
import { VectorKnowledgeTools } from './vector-knowledge-tools.js';
import { UnifiedMemoryFacade } from './unified-memory-facade.js';

/**
 * Behavioral Memory Tool Definitions
 * Tools for claims, violations, rules, and behavioral patterns
 */
export function getBehavioralMemoryTools(memoryManager: MnemosyneMemorySystem) {
	const behavioral = new BehavioralMemoryTools();

	return {
		memory_log_claim: {
			name: 'memory_log_claim',
			description: 'Log a claim or assertion made by the AI agent that requires verification. CRITICAL: Use this immediately after making any factual statement, assumption, or conclusion to enable later accountability and behavioral correction. This tool is essential for maintaining truth tracking and preventing false confidence in unverified statements.',
			inputSchema: {
				type: 'object',
				properties: {
					claim: {
						type: 'string',
						description: 'The exact claim being made (e.g., \'The deployment was successful\', \'The bug is in line 42\', \'User wants feature X\')'
					},
					confidence: {
						type: 'string',
						enum: ['low', 'medium', 'high'],
						description: 'Agent\'s confidence level in this claim - use \'low\' for assumptions, \'high\' for verified facts'
					},
					source: {
						type: 'string',
						description: 'Source of information supporting this claim (e.g., \'file analysis\', \'user statement\', \'documentation\')'
					},
					context: {
						type: 'object',
						description: 'Additional context including reasoning, assumptions, or supporting data that led to this claim',
						additionalProperties: true
					}
				},
				required: ['claim'],
				additionalProperties: false
			}
		},

		memory_verify_claim: {
			name: 'memory_verify_claim',
			description: 'Verify a previously logged claim with concrete evidence. ESSENTIAL: Use this when you obtain evidence that confirms or refutes a previous claim. This tool is critical for behavioral integrity and self-correction - it prevents the agent from maintaining false beliefs and enables learning from verification outcomes.',
			inputSchema: {
				type: 'object',
				properties: {
					claimId: {
						type: 'string',
						description: 'The unique ID of the claim to verify (obtained from memory_log_claim)'
					},
					success: {
						type: 'boolean',
						description: 'Whether the claim was verified as TRUE (confirmed by evidence) or FALSE (refuted by evidence)'
					},
					evidence: {
						type: 'string',
						description: 'Concrete evidence supporting or refuting the claim - be specific about what was observed, tested, or confirmed'
					},
					notes: {
						type: 'string',
						description: 'Additional notes about the verification process, lessons learned, or implications'
					}
				},
				required: ['claimId', 'success', 'evidence'],
				additionalProperties: false
			}
		},

		memory_record_violation: {
			name: 'memory_record_violation',
			description: 'Record a violation of established behavioral rules when detected. CRITICAL for self-correction: Use this immediately when you recognize that previous actions violated behavioral guidelines. This tool enables learning from mistakes and prevents repeated violations of the same rules.',
			inputSchema: {
				type: 'object',
				properties: {
					ruleId: {
						type: 'string',
						description: 'The ID of the behavioral rule that was violated (from foundation rules or custom rules)'
					},
					context: {
						type: 'string',
						description: 'Detailed description of how and when the violation occurred, including specific actions taken'
					},
					severity: {
						type: 'string',
						enum: ['minor', 'moderate', 'major', 'critical'],
						description: 'Severity assessment of the violation'
					},
					correctionPlan: {
						type: 'string',
						description: 'Specific plan for correcting the violation and preventing recurrence'
					}
				},
				required: ['ruleId', 'context'],
				additionalProperties: false
			}
		},

		memory_check_behavioral_status: {
			name: 'memory_check_behavioral_status',
			description: 'Check current behavioral status including unverified claims, rule violations, and compliance metrics. ESSENTIAL for self-monitoring: Use this tool regularly to assess behavioral performance and identify areas needing attention. This enables proactive behavioral correction and maintains awareness of Mnemosyne memory state.',
			inputSchema: {
				type: 'object',
				properties: {
					focusArea: {
						type: 'string',
						enum: ['claims', 'violations', 'patterns', 'all'],
						description: 'Focus the status check on specific behavioral area'
					},
					includeHistory: {
						type: 'string',
						description: 'Whether to include detailed historical behavioral data and patterns'
					}
				},
				additionalProperties: false
			}
		}
	};
}

/**
 * Vector Knowledge Tool Definitions
 * Tools for semantic search, knowledge storage, and tiered memory
 */
export function getVectorKnowledgeTools(memoryManager: MnemosyneMemorySystem) {
	const vector = new VectorKnowledgeTools();

	return {
		memory_store_knowledge: {
			name: 'memory_store_knowledge',
			description: 'store knowledge with semantic embeddings for RAG-based retrieval. Extends Mnemosyne\'s behavioral memory with working memory capabilities for contextual information storage and semantic search.',
			inputSchema: {
				type: 'object',
				properties: {
					content: {
						type: 'string',
						description: 'The knowledge content to store (text, facts, procedures, etc.)'
					},
					metadata: {
						type: 'object',
						description: 'Structured metadata about the knowledge (type, domain, importance, etc.)',
						additionalProperties: true
					},
					tags: {
						type: 'array',
						items: { type: 'string' },
						description: 'Tags for categorization and filtering'
					}
				},
				required: ['content'],
				additionalProperties: false
			}
		},

		memory_search_knowledge: {
			name: 'memory_search_knowledge',
			description: 'search knowledge using semantic similarity. Performs RAG-based retrieval to find contextually relevant information from the working memory knowledge base.',
			inputSchema: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'The search query or question to find related knowledge'
					},
					threshold: {
						type: 'number',
						description: 'Minimum similarity threshold for results (0-1, default: 0.05 for inclusive search)'
					},
					limit: {
						type: 'number',
						description: 'Maximum number of results to return (default: 8)'
					}
				},
				required: ['query'],
				additionalProperties: false
			}
		},

		memory_store_tiered: {
			name: 'memory_store_tiered',
			description: 'Store knowledge in the multi-tier memory system with automatic tier placement based on importance. Provides hierarchical memory with short-term (working), intermediate-term (frequent), and long-term (important) storage.',
			inputSchema: {
				type: 'object',
				properties: {
					content: {
						type: 'string',
						description: 'The knowledge content to store'
					},
					importance: {
						type: 'number',
						description: 'Importance score 0-1 (determines tier placement: <0.3=short, 0.3-0.7=intermediate, >0.7=long)'
					},
					targetTier: {
						type: 'string',
						enum: ['short', 'intermediate', 'long'],
						description: 'Override automatic tier placement'
					},
					metadata: {
						type: 'object',
						description: 'Additional metadata',
						additionalProperties: true
					},
					tags: {
						type: 'array',
						items: { type: 'string' },
						description: 'Tags for categorization'
					}
				},
				required: ['content'],
				additionalProperties: false
			}
		},

		memory_search_tiered: {
			name: 'memory_search_tiered',
			description: 'Search across all memory tiers or target specific tiers with tier-aware ranking. Higher tiers (long-term) receive ranking boosts for better recall of important information.',
			inputSchema: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'The search query'
					},
					threshold: {
						type: 'number',
						description: 'Similarity threshold (default: 0.05 for inclusive search)'
					},
					limit: {
						type: 'number',
						description: 'Maximum results (default: 8)'
					},
					tierPreference: {
						type: 'string',
						enum: ['short', 'intermediate', 'long', 'all'],
						description: 'Which tier(s) to search (default: all)'
					}
				},
				required: ['query'],
				additionalProperties: false
			}
		}
	};
}

/**
 * System Integration Tool Definitions
 * Tools for system health, exports, and cross-system operations
 */
export function getSystemIntegrationTools(memoryManager: MnemosyneMemorySystem) {
	const unified = new UnifiedMemoryFacade();

	return {
		memory_view_foundation: {
			name: 'memory_view_foundation',
			description: 'View the foundational behavioral rules that are automatically active in the Mnemosyne memory system. ESSENTIAL FIRST STEP: Use this tool immediately when connecting to understand the behavioral framework and constraints that govern AI actions. These rules form the safety and operational foundation for all agent behavior.',
			inputSchema: {
				type: 'object',
				properties: {
					ruleId: {
						type: 'string',
						description: 'View details for a specific foundation rule by ID'
					},
					includeExamples: {
						type: 'string',
						description: 'Include practical examples of rule application'
					},
					checkCompliance: {
						type: 'string',
						description: 'Include current compliance status for each rule'
					}
				},
				additionalProperties: false
			}
		},

		memory_export_state: {
			name: 'memory_export_state',
			description: 'Export the complete Mnemosyne memory system state for analysis, debugging, or persistence. Use this tool when you need comprehensive insight into behavioral patterns, claim verification history, or system performance. Essential for deep analysis and understanding behavioral trends over time.',
			inputSchema: {
				type: 'object',
				properties: {
					format: {
						type: 'string',
						enum: ['summary', 'detailed', 'raw'],
						description: 'Export format: \'summary\' for overview, \'detailed\' for analysis, \'raw\' for complete data'
					},
					filterType: {
						type: 'string',
						enum: ['claims', 'violations', 'rules', 'all'],
						description: 'Filter export to specific data types'
					},
					includeMetadata: {
						type: 'string',
						description: 'Whether to include system metadata and timestamps'
					}
				},
				additionalProperties: false
			}
		},

		memory_sanity_check: {
			name: 'memory_sanity_check',
			description: 'Comprehensive memory system health check to detect catastrophic failures and enable auto-correction. Checks for empty memory, storage/retrieval bugs, missing foundation rules, and broken behavioral patterns. CRITICAL for detecting when memory system has failed and needs restoration.',
			inputSchema: {
				type: 'object',
				properties: {
					autoCorrect: {
						type: 'boolean',
						description: 'Whether to automatically attempt corrections when failures are detected'
					},
					emergencyMode: {
						type: 'boolean',
						description: 'Run in emergency mode with aggressive sanity checks'
					},
					includeRestorePlan: {
						type: 'boolean',
						description: 'Include detailed plan for memory restoration if failures detected'
					}
				},
				additionalProperties: false
			}
		},

		memory_stats_tiered: {
			name: 'memory_stats_tiered',
			description: 'Get memory statistics across all tiers including usage, capacity, and access patterns. Useful for monitoring memory system performance and tier utilization.',
			inputSchema: {
				type: 'object',
				properties: {},
				additionalProperties: false
			}
		},

		memory_tune_search_thresholds: {
			name: 'memory_tune_search_thresholds',
			description: 'Dynamically adjust semantic search thresholds based on workload characteristics and desired precision/recall balance. Use this tool to optimize search performance for specific tasks or contexts.',
			inputSchema: {
				type: 'object',
				properties: {
					workloadType: {
						type: 'string',
						enum: ['exploration', 'precision', 'recall', 'balanced', 'debugging'],
						description: 'Type of workload: \'exploration\' (very low threshold), \'precision\' (high threshold), \'recall\' (low threshold), \'balanced\' (moderate), \'debugging\' (adaptive)'
					},
					contextComplexity: {
						type: 'string',
						enum: ['simple', 'moderate', 'complex'],
						description: 'Complexity of the search context (affects threshold adjustment)'
					},
					expectedResultCount: {
						type: 'number',
						description: 'Expected number of relevant results (influences threshold tuning)'
					},
					customThreshold: {
						type: 'number',
						description: 'Override with specific threshold (0-1)'
					}
				},
				required: ['workloadType'],
				additionalProperties: false
			}
		},

		memory_update_foundation: {
			name: 'memory_update_foundation',
			description: 'Deploy a new foundation migration to the running server. POWERFUL: This tool enables hot-deployment of behavioral rule changes without server restart. Use for A/B testing behavioral rules, emergency corrections, or gradual rollouts of foundation updates. Validate carefully before deployment.',
			inputSchema: {
				type: 'object',
				properties: {
					migration: {
						type: 'object',
						description: 'Complete foundation migration object with rules, patterns, and metadata',
						additionalProperties: true
					},
					options: {
						type: 'object',
						description: 'Update options and behavior controls',
						additionalProperties: true
					}
				},
				required: ['migration'],
				additionalProperties: false
			}
		}
	};
}

/**
 * Complete Tool Registry
 * Unified registration of all subsystem tools with backward compatibility
 */
export function getAllMemoryTools(memoryManager: MnemosyneMemorySystem) {
	return {
		...getBehavioralMemoryTools(memoryManager),
		...getVectorKnowledgeTools(memoryManager),
		...getSystemIntegrationTools(memoryManager),
		
		// Legacy compatibility tool
		memory_backfill_from_vector_store: {
			name: 'memory_backfill_from_vector_store',
			description: 'Restore memory system from vector store backup. Use when memory system needs restoration from persistent storage.',
			inputSchema: {
				type: 'object',
				properties: {
					namespace: {
						type: 'string',
						description: 'Namespace to restore from (optional, defaults to main namespace)'
					},
					validateContent: {
						type: 'boolean',
						description: 'Whether to validate content during restoration'
					},
					preserveTimestamps: {
						type: 'boolean',
						description: 'Whether to preserve original timestamps from backup'
					}
				},
				additionalProperties: false
			}
		}
	};
}

/**
 * Tool Registration by Category
 * Allow selective registration for specific use cases
 */
export const ToolCategories = {
	BEHAVIORAL: 'behavioral',
	VECTOR: 'vector', 
	INTEGRATION: 'integration',
	ALL: 'all'
} as const;

export function getToolsByCategory(
	category: keyof typeof ToolCategories,
	memoryManager: MnemosyneMemorySystem
) {
	switch (category) {
		case 'BEHAVIORAL':
			return getBehavioralMemoryTools(memoryManager);
		case 'VECTOR':
			return getVectorKnowledgeTools(memoryManager);
		case 'INTEGRATION':
			return getSystemIntegrationTools(memoryManager);
		case 'ALL':
		default:
			return getAllMemoryTools(memoryManager);
	}
}
