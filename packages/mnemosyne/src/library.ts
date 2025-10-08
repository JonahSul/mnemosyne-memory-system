/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Mnemosyne Memory System - Domain Architecture Exports
 * 
 * Domain-driven architecture with service layer orchestration
 */

// Core architecture exports
export * from './core/types';
export * from './core/base';

// Service layer exports
export * from './services/MemoryService';

// Domain layer exports
export * from './domains';

// Type aliases for convenience
export type {
	TieredKnowledgeItem as MemoryItem,
	MemorySearchResult as SearchResult,
	CoreMemoryConfig as MemoryConfig
} from './domains/memory';
