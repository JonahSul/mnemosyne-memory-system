/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Base Manager Class
 *
 * Abstract base class providing common functionality for all domain managers
 * Implements dependency injection patterns and standard operations
 */
import { BaseOperations } from './BaseOperations';
export interface ManagerDependencies {
    logger?: Console;
    metrics?: MetricsCollector;
    config?: Record<string, any>;
}
export interface MetricsCollector {
    increment(name: string, tags?: Record<string, string>): void;
    gauge(name: string, value: number, tags?: Record<string, string>): void;
    timing(name: string, duration: number, tags?: Record<string, string>): void;
}
/**
 * Abstract base manager class implementing common patterns
 */
export declare abstract class BaseManager<T = any, K = string> implements BaseOperations<T, K> {
    protected readonly logger: Console;
    protected readonly metrics: MetricsCollector | undefined;
    protected readonly config: Record<string, any>;
    protected initialized: boolean;
    constructor(dependencies?: ManagerDependencies);
    /**
     * Initialize the manager - must be implemented by subclasses
     */
    abstract initialize(): Promise<void>;
    /**
     * Get an item by its identifier - must be implemented by subclasses
     */
    abstract get(id: K): Promise<T | null>;
    /**
     * Create a new item - must be implemented by subclasses
     */
    abstract create(data: Partial<T>): Promise<T>;
    /**
     * Update an existing item - must be implemented by subclasses
     */
    abstract update(id: K, data: Partial<T>): Promise<T>;
    /**
     * Delete an item - must be implemented by subclasses
     */
    abstract delete(id: K): Promise<boolean>;
    /**
     * List items with optional filtering - must be implemented by subclasses
     */
    abstract list(filter?: Record<string, any>): Promise<T[]>;
    /**
     * Validate an item - must be implemented by subclasses
     */
    abstract validate(data: Partial<T>): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * Get health status of the manager
     */
    health(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: Record<string, any>;
    }>;
    /**
     * Clean up resources
     */
    cleanup(): Promise<void>;
    /**
     * Ensure the manager is initialized
     */
    protected ensureInitialized(): void;
    /**
     * Log with consistent formatting
     */
    protected log(level: 'log' | 'warn' | 'error', message: string, ...args: any[]): void;
    /**
     * Record metrics if available
     */
    protected recordMetric(type: 'increment' | 'gauge' | 'timing', name: string, value?: number, tags?: Record<string, string>): void;
    /**
     * Time a function execution and record metrics
     */
    protected withTiming<R>(name: string, fn: () => Promise<R>): Promise<R>;
    /**
     * Perform health check - override in subclasses for specific checks
     */
    protected performHealthCheck(): Promise<void>;
}
//# sourceMappingURL=BaseManager.d.ts.map