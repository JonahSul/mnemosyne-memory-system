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
export abstract class BaseManager<T = any, K = string> implements BaseOperations<T, K> {
	protected readonly logger: Console;
	protected readonly metrics: MetricsCollector | undefined;
	protected readonly config: Record<string, any>;
	protected initialized = false;

	constructor(dependencies: ManagerDependencies = {}) {
		this.logger = dependencies.logger || console;
		this.metrics = dependencies.metrics;
		this.config = dependencies.config || {};
	}

	/**
	 * Initialize the manager - must be implemented by subclasses
	 */
	public abstract initialize(): Promise<void>;

	/**
	 * Get an item by its identifier - must be implemented by subclasses
	 */
	public abstract get(id: K): Promise<T | null>;

	/**
	 * Create a new item - must be implemented by subclasses
	 */
	public abstract create(data: Partial<T>): Promise<T>;

	/**
	 * Update an existing item - must be implemented by subclasses
	 */
	public abstract update(id: K, data: Partial<T>): Promise<T>;

	/**
	 * Delete an item - must be implemented by subclasses
	 */
	public abstract delete(id: K): Promise<boolean>;

	/**
	 * List items with optional filtering - must be implemented by subclasses
	 */
	public abstract list(filter?: Record<string, any>): Promise<T[]>;

	/**
	 * Validate an item - must be implemented by subclasses
	 */
	public abstract validate(data: Partial<T>): Promise<{ valid: boolean; errors: string[] }>;

	/**
	 * Get health status of the manager
	 */
	public async health(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: Record<string, any> }> {
		const details: Record<string, any> = {
			initialized: this.initialized,
			className: this.constructor.name
		};

		try {
			await this.performHealthCheck();
			return { status: 'healthy', details };
		} catch (error) {
			details.error = error instanceof Error ? error.message : String(error);
			return { status: 'unhealthy', details };
		}
	}

	/**
	 * Clean up resources
	 */
	public async cleanup(): Promise<void> {
		this.logger.log(`Cleaning up ${this.constructor.name}`);
		this.initialized = false;
	}

	/**
	 * Ensure the manager is initialized
	 */
	protected ensureInitialized(): void {
		if (!this.initialized) {
			throw new Error(`${this.constructor.name} must be initialized before use`);
		}
	}

	/**
	 * Log with consistent formatting
	 */
	protected log(level: 'log' | 'warn' | 'error', message: string, ...args: any[]): void {
		const timestamp = new Date().toISOString();
		const formattedMessage = `[${timestamp}] ${this.constructor.name}: ${message}`;
		this.logger[level](formattedMessage, ...args);
	}

	/**
	 * Record metrics if available
	 */
	protected recordMetric(type: 'increment' | 'gauge' | 'timing', name: string, value?: number, tags?: Record<string, string>): void {
		if (!this.metrics) return;

		const metricName = `${this.constructor.name.toLowerCase()}.${name}`;
		const metricTags = { manager: this.constructor.name, ...tags };

		switch (type) {
			case 'increment':
				this.metrics.increment(metricName, metricTags);
				break;
			case 'gauge':
				this.metrics.gauge(metricName, value || 0, metricTags);
				break;
			case 'timing':
				this.metrics.timing(metricName, value || 0, metricTags);
				break;
		}
	}

	/**
	 * Time a function execution and record metrics
	 */
	protected async withTiming<R>(name: string, fn: () => Promise<R>): Promise<R> {
		const start = Date.now();
		try {
			const result = await fn();
			this.recordMetric('timing', name, Date.now() - start, { status: 'success' });
			return result;
		} catch (error) {
			this.recordMetric('timing', name, Date.now() - start, { status: 'error' });
			throw error;
		}
	}

	/**
	 * Perform health check - override in subclasses for specific checks
	 */
	protected async performHealthCheck(): Promise<void> {
		// Base implementation - just check if initialized
		if (!this.initialized) {
			throw new Error('Manager not initialized');
		}
	}
}
