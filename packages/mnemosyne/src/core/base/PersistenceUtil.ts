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
export class PersistenceUtil {
	/**
	 * Generate a namespaced key
	 */
	static generateKey(namespace: string, ...parts: string[]): string {
		return [namespace, ...parts].join(':');
	}

	/**
	 * Create metadata for a new item
	 */
	static createMetadata(options: Partial<PersistenceMetadata> = {}): PersistenceMetadata {
		const now = Date.now();
		return {
			createdAt: now,
			updatedAt: now,
			version: 1,
			...options
		};
	}

	/**
	 * Update metadata for an existing item
	 */
	static updateMetadata(existing: PersistenceMetadata): PersistenceMetadata {
		return {
			...existing,
			updatedAt: Date.now(),
			version: existing.version + 1
		};
	}

	/**
	 * Calculate checksum for data integrity
	 */
	static async calculateChecksum(data: any): Promise<string> {
		const text = typeof data === 'string' ? data : JSON.stringify(data);
		const encoder = new TextEncoder();
		const dataArray = encoder.encode(text);
		const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	}

	/**
	 * Compress data for storage efficiency
	 */
	static async compress(data: string): Promise<Uint8Array> {
		const stream = new CompressionStream('gzip');
		const writer = stream.writable.getWriter();
		const reader = stream.readable.getReader();
		
		const encoder = new TextEncoder();
		await writer.write(encoder.encode(data));
		await writer.close();
		
		const chunks: Uint8Array[] = [];
		let result = await reader.read();
		while (!result.done) {
			chunks.push(result.value);
			result = await reader.read();
		}
		
		// Combine chunks into single array
		const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
		const compressed = new Uint8Array(totalLength);
		let offset = 0;
		for (const chunk of chunks) {
			compressed.set(chunk, offset);
			offset += chunk.length;
		}
		
		return compressed;
	}

	/**
	 * Decompress data from storage
	 */
	static async decompress(compressed: Uint8Array): Promise<string> {
		const stream = new DecompressionStream('gzip');
		const writer = stream.writable.getWriter();
		const reader = stream.readable.getReader();
		
		await writer.write(compressed);
		await writer.close();
		
		const chunks: Uint8Array[] = [];
		let result = await reader.read();
		while (!result.done) {
			chunks.push(result.value);
			result = await reader.read();
		}
		
		// Combine chunks and decode
		const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
		const decompressed = new Uint8Array(totalLength);
		let offset = 0;
		for (const chunk of chunks) {
			decompressed.set(chunk, offset);
			offset += chunk.length;
		}
		
		const decoder = new TextDecoder();
		return decoder.decode(decompressed);
	}

	/**
	 * Serialize data for storage
	 */
	static serialize(data: any): string {
		if (typeof data === 'string') {
			return data;
		}
		return JSON.stringify(data);
	}

	/**
	 * Deserialize data from storage
	 */
	static deserialize<T>(serialized: string): T {
		try {
			return JSON.parse(serialized);
		} catch {
			// Return as string if not valid JSON
			return serialized as T;
		}
	}

	/**
	 * Validate storage key format
	 */
	static validateKey(key: string): boolean {
		// Keys should be non-empty, alphanumeric with colons and dashes
		return /^[a-zA-Z0-9:_-]+$/.test(key) && key.length > 0 && key.length <= 512;
	}

	/**
	 * Sanitize a key to ensure it's valid
	 */
	static sanitizeKey(key: string): string {
		return key
			.replace(/[^a-zA-Z0-9:_-]/g, '_')
			.substring(0, 512);
	}
}
