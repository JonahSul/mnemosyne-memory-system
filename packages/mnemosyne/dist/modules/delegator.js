/**
 * Global Delegator Module
 *
 * Provides a clean delegation pattern for decomposing large modules
 * and orchestrating focused domain modules with minimal coupling.
 */
export class Delegator {
    targets = new Map();
    methodMap = new Map();
    fallbackHandler;
    constructor(config) {
        this.fallbackHandler = config.fallbackHandler;
        this.registerTargets(config.targets);
    }
    registerTargets(targets) {
        for (const target of targets) {
            this.targets.set(target.name, target.module);
            // Map each method to its target module
            for (const method of target.methods) {
                if (this.methodMap.has(method)) {
                    throw new Error(`Method collision: ${method} is already mapped to ${this.methodMap.get(method)}`);
                }
                this.methodMap.set(method, target.name);
            }
        }
    }
    /**
     * Delegate a method call to the appropriate target module
     */
    async delegate(methodName, ...args) {
        const targetName = this.methodMap.get(methodName);
        if (!targetName) {
            if (this.fallbackHandler) {
                return this.fallbackHandler(methodName, args);
            }
            throw new Error(`No delegation target found for method: ${methodName}`);
        }
        const target = this.targets.get(targetName);
        if (!target || typeof target[methodName] !== 'function') {
            throw new Error(`Method ${methodName} not found on target ${targetName}`);
        }
        // Handle both sync and async methods
        const result = target[methodName](...args);
        return result instanceof Promise ? result : Promise.resolve(result);
    }
    /**
     * Delegate a method call synchronously (for methods that don't need async)
     */
    delegateSync(methodName, ...args) {
        const targetName = this.methodMap.get(methodName);
        if (!targetName) {
            if (this.fallbackHandler) {
                return this.fallbackHandler(methodName, args);
            }
            throw new Error(`No delegation target found for method: ${methodName}`);
        }
        const target = this.targets.get(targetName);
        if (!target || typeof target[methodName] !== 'function') {
            throw new Error(`Method ${methodName} not found on target ${targetName}`);
        }
        // Call the method synchronously
        return target[methodName](...args);
    }
    /**
     * Get the target module for a specific method (useful for direct access)
     */
    getTarget(methodName) {
        const targetName = this.methodMap.get(methodName);
        return targetName ? this.targets.get(targetName) : null;
    }
    /**
     * Check if a method is available for delegation
     */
    hasMethod(methodName) {
        return this.methodMap.has(methodName);
    }
    /**
     * Get all available methods across all targets
     */
    getAvailableMethods() {
        return Array.from(this.methodMap.keys());
    }
    /**
     * Get delegation statistics for monitoring
     */
    getDelegationStats() {
        const methodsByTarget = {};
        for (const [method, target] of this.methodMap.entries()) {
            methodsByTarget[target] = (methodsByTarget[target] || 0) + 1;
        }
        return {
            targets: this.targets.size,
            methods: this.methodMap.size,
            methodsByTarget
        };
    }
}
/**
 * Factory function for creating method delegation proxies
 */
export function createDelegatedMethods(delegator, methods) {
    const delegatedMethods = {};
    for (const method of methods) {
        delegatedMethods[method] = async (...args) => {
            return delegator.delegate(method, ...args);
        };
    }
    return delegatedMethods;
}
/**
 * Utility for automatic method discovery and delegation setup
 */
export function autodiscoverMethods(moduleInstance, excludePattern) {
    const methods = [];
    const prototype = Object.getPrototypeOf(moduleInstance);
    for (const name of Object.getOwnPropertyNames(prototype)) {
        if (name !== 'constructor' && typeof moduleInstance[name] === 'function') {
            if (!excludePattern || !excludePattern.test(name)) {
                methods.push(name);
            }
        }
    }
    return methods;
}
