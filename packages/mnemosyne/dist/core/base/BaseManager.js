/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Base Manager Class
 *
 * Abstract base class providing common functionality for all domain managers
 * Implements dependency injection patterns and standard operations
 */
/**
 * Abstract base manager class implementing common patterns
 */
export class BaseManager {
    logger;
    metrics;
    config;
    initialized = false;
    constructor(dependencies = {}) {
        this.logger = dependencies.logger || console;
        this.metrics = dependencies.metrics;
        this.config = dependencies.config || {};
    }
    /**
     * Get health status of the manager
     */
    async health() {
        const details = {
            initialized: this.initialized,
            className: this.constructor.name
        };
        try {
            await this.performHealthCheck();
            return { status: 'healthy', details };
        }
        catch (error) {
            details.error = error instanceof Error ? error.message : String(error);
            return { status: 'unhealthy', details };
        }
    }
    /**
     * Clean up resources
     */
    async cleanup() {
        this.logger.log(`Cleaning up ${this.constructor.name}`);
        this.initialized = false;
    }
    /**
     * Ensure the manager is initialized
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error(`${this.constructor.name} must be initialized before use`);
        }
    }
    /**
     * Log with consistent formatting
     */
    log(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] ${this.constructor.name}: ${message}`;
        this.logger[level](formattedMessage, ...args);
    }
    /**
     * Record metrics if available
     */
    recordMetric(type, name, value, tags) {
        if (!this.metrics)
            return;
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
    async withTiming(name, fn) {
        const start = Date.now();
        try {
            const result = await fn();
            this.recordMetric('timing', name, Date.now() - start, { status: 'success' });
            return result;
        }
        catch (error) {
            this.recordMetric('timing', name, Date.now() - start, { status: 'error' });
            throw error;
        }
    }
    /**
     * Perform health check - override in subclasses for specific checks
     */
    async performHealthCheck() {
        // Base implementation - just check if initialized
        if (!this.initialized) {
            throw new Error('Manager not initialized');
        }
    }
}
