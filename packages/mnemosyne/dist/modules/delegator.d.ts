/**
 * Global Delegator Module
 *
 * Provides a clean delegation pattern for decomposing large modules
 * and orchestrating focused domain modules with minimal coupling.
 */
export interface DelegationTarget {
    name: string;
    module: any;
    methods: string[];
}
export interface DelegatorConfig {
    targets: DelegationTarget[];
    fallbackHandler?: (methodName: string, args: any[]) => any;
}
export declare class Delegator {
    private targets;
    private methodMap;
    private fallbackHandler;
    constructor(config: DelegatorConfig);
    private registerTargets;
    /**
     * Delegate a method call to the appropriate target module
     */
    delegate(methodName: string, ...args: any[]): Promise<any>;
    /**
     * Delegate a method call synchronously (for methods that don't need async)
     */
    delegateSync(methodName: string, ...args: any[]): any;
    /**
     * Get the target module for a specific method (useful for direct access)
     */
    getTarget(methodName: string): any;
    /**
     * Check if a method is available for delegation
     */
    hasMethod(methodName: string): boolean;
    /**
     * Get all available methods across all targets
     */
    getAvailableMethods(): string[];
    /**
     * Get delegation statistics for monitoring
     */
    getDelegationStats(): {
        targets: number;
        methods: number;
        methodsByTarget: Record<string, number>;
    };
}
/**
 * Factory function for creating method delegation proxies
 */
export declare function createDelegatedMethods<T>(delegator: Delegator, methods: string[]): Record<string, (...args: any[]) => Promise<any>>;
/**
 * Utility for automatic method discovery and delegation setup
 */
export declare function autodiscoverMethods(moduleInstance: any, excludePattern?: RegExp): string[];
//# sourceMappingURL=delegator.d.ts.map