/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Base Operations Interface
 *
 * Standardized operations interface for all domain managers
 * Provides consistent API patterns across the system
 */
export interface BaseOperations<T = any, K = string> {
    /**
     * Initialize the operations instance
     */
    initialize(): Promise<void>;
    /**
     * Get an item by its identifier
     */
    get(id: K): Promise<T | null>;
    /**
     * Create a new item
     */
    create(data: Partial<T>): Promise<T>;
    /**
     * Update an existing item
     */
    update(id: K, data: Partial<T>): Promise<T>;
    /**
     * Delete an item
     */
    delete(id: K): Promise<boolean>;
    /**
     * List items with optional filtering
     */
    list(filter?: Record<string, any>): Promise<T[]>;
    /**
     * Validate an item
     */
    validate(data: Partial<T>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * Get health status of the operations instance
     */
    health(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: Record<string, any>;
    }>;
    /**
     * Clean up resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=BaseOperations.d.ts.map