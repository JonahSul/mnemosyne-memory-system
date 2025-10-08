/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Persistence Utilities
 *
 * Common persistence patterns and utilities for memory operations
 * Provides standardized persistence interfaces and implementations
 */
export interface PersistenceConfig {
    namespace: string;
    ttl?: number;
    enableCompression?: boolean;
    enableEncryption?: boolean;
}
export interface PersistenceMetadata {
    createdAt: number;
    updatedAt: number;
    version: number;
    checksum?: string;
    compressed?: boolean;
    encrypted?: boolean;
}
export interface PersistedItem<T = any> {
    data: T;
    metadata: PersistenceMetadata;
}
export interface PersistenceLayer {
    /**
     * Store an item with metadata
     */
    put<T>(key: string, data: T, config?: Partial<PersistenceConfig>): Promise<void>;
    /**
     * Retrieve an item with metadata
     */
    get<T>(key: string): Promise<PersistedItem<T> | null>;
    /**
     * Delete an item
     */
    delete(key: string): Promise<boolean>;
    /**
     * List keys with optional prefix
     */
    list(prefix?: string): Promise<string[]>;
    /**
     * Check if a key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Get size of stored data
     */
    size(key: string): Promise<number>;
    /**
     * Batch operations
     */
    batch(operations: PersistenceOperation[]): Promise<PersistenceResult[]>;
}
export interface PersistenceOperation {
    type: 'put' | 'get' | 'delete';
    key: string;
    data?: any;
    config?: Partial<PersistenceConfig>;
}
export interface PersistenceResult {
    success: boolean;
    key: string;
    data?: any;
    error?: string;
}
/**
 * Utility class for common persistence operations
 */
export declare class PersistenceUtil {
    /**
     * Generate a namespaced key
     */
    static generateKey(namespace: string, ...parts: string[]): string;
    /**
     * Create metadata for a new item
     */
    static createMetadata(options?: Partial<PersistenceMetadata>): PersistenceMetadata;
    /**
     * Update metadata for an existing item
     */
    static updateMetadata(existing: PersistenceMetadata): PersistenceMetadata;
    /**
     * Calculate checksum for data integrity
     */
    static calculateChecksum(data: any): Promise<string>;
    /**
     * Compress data for storage efficiency
     */
    static compress(data: string): Promise<Uint8Array>;
    /**
     * Decompress data from storage
     */
    static decompress(compressed: Uint8Array): Promise<string>;
    /**
     * Serialize data for storage
     */
    static serialize(data: any): string;
    /**
     * Deserialize data from storage
     */
    static deserialize<T>(serialized: string): T;
    /**
     * Validate storage key format
     */
    static validateKey(key: string): boolean;
    /**
     * Sanitize a key to ensure it's valid
     */
    static sanitizeKey(key: string): string;
}
//# sourceMappingURL=PersistenceUtil.d.ts.map