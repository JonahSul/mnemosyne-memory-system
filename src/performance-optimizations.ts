/**
 * Performance Optimization Utilities
 * Comprehensive performance improvements with lazy loading, caching, and batching
 */

// Enhanced caching system with intelligent invalidation
export class PerformanceCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; hits: number }>();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds
  
  constructor(maxSize: number = 1000, ttlMs: number = 300000) { // 5 min default TTL
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }
  
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Update access pattern
    entry.hits++;
    entry.timestamp = Date.now(); // Refresh on access
    
    return entry.value;
  }
  
  set(key: string, value: T): void {
    // Evict expired entries first
    this.evictExpired();
    
    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0
    });
  }
  
  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < lruTime) {
        lruTime = entry.timestamp;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats(): { size: number; hitRate: number } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const totalRequests = entries.length;
    
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0
    };
  }
}

// Batch processor for reducing async overhead
export class BatchProcessor<TInput, TOutput> {
  private readonly batchSize: number;
  private readonly flushInterval: number;
  private readonly processor: (items: TInput[]) => Promise<TOutput[]>;
  
  private batch: TInput[] = [];
  private resolvers: Array<(result: TOutput) => void> = [];
  private rejectors: Array<(error: Error) => void> = [];
  private timer: number | null = null;
  
  constructor(
    processor: (items: TInput[]) => Promise<TOutput[]>,
    batchSize: number = 10,
    flushIntervalMs: number = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.flushInterval = flushIntervalMs;
  }
  
  async process(item: TInput): Promise<TOutput> {
    return new Promise((resolve, reject) => {
      this.batch.push(item);
      this.resolvers.push(resolve);
      this.rejectors.push(reject);
      
      // Flush if batch is full
      if (this.batch.length >= this.batchSize) {
        this.flush();
      } else if (!this.timer) {
        // Set timer for automatic flush
        this.timer = setTimeout(() => this.flush(), this.flushInterval) as any;
      }
    });
  }
  
  private async flush(): Promise<void> {
    if (this.batch.length === 0) return;
    
    const currentBatch = this.batch;
    const currentResolvers = this.resolvers;
    const currentRejectors = this.rejectors;
    
    // Reset for next batch
    this.batch = [];
    this.resolvers = [];
    this.rejectors = [];
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    try {
      const results = await this.processor(currentBatch);
      
      // Resolve individual promises
      results.forEach((result, index) => {
        if (currentResolvers[index]) {
          currentResolvers[index](result);
        }
      });
    } catch (error) {
      // Reject all promises in batch
      currentRejectors.forEach(reject => {
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    }
  }
  
  async forceFlush(): Promise<void> {
    await this.flush();
  }
}

// Lazy loading system for heavy operations
export class LazyLoader<T> {
  private value: T | undefined = undefined;
  private loading = false;
  private error: Error | undefined = undefined;
  private loadPromise: Promise<T> | undefined = undefined;
  
  constructor(private loader: () => Promise<T>) {}
  
  async get(): Promise<T> {
    if (this.value !== undefined) {
      return this.value;
    }
    
    if (this.error) {
      throw this.error;
    }
    
    if (this.loading && this.loadPromise) {
      return this.loadPromise;
    }
    
    this.loading = true;
    this.loadPromise = this.loader()
      .then(value => {
        this.value = value;
        this.loading = false;
        return value;
      })
      .catch(error => {
        this.error = error;
        this.loading = false;
        throw error;
      });
    
    return this.loadPromise;
  }
  
  isLoaded(): boolean {
    return this.value !== undefined;
  }
  
  reset(): void {
    this.value = undefined;
    this.loading = false;
    this.error = undefined;
    this.loadPromise = undefined;
  }
}

// Memory pool for object reuse
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  
  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize: number = 10
  ) {
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }
  
  acquire(): T {
    let obj = this.available.pop();
    
    if (!obj) {
      obj = this.factory();
    }
    
    this.inUse.add(obj);
    return obj;
  }
  
  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      this.available.push(obj);
    }
  }
  
  getStats(): { available: number; inUse: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size
    };
  }
}

// Debounced function execution
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: number | null = null;
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait) as any;
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

// Throttled function execution
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  }) as T;
}

// Async iterator with backpressure control
export class AsyncIteratorController<T> {
  private queue: T[] = [];
  private waitingResolvers: Array<(value: IteratorResult<T>) => void> = [];
  private finished = false;
  private readonly maxQueueSize: number;
  
  constructor(maxQueueSize: number = 100) {
    this.maxQueueSize = maxQueueSize;
  }
  
  async *[Symbol.asyncIterator](): AsyncGenerator<T> {
    while (!this.finished || this.queue.length > 0) {
      if (this.queue.length > 0) {
        yield this.queue.shift()!;
      } else {
        const result = await new Promise<IteratorResult<T>>(resolve => {
          this.waitingResolvers.push(resolve);
        });
        
        if (!result.done) {
          yield result.value;
        }
      }
    }
  }
  
  push(value: T): boolean {
    if (this.finished) {
      return false;
    }
    
    if (this.queue.length >= this.maxQueueSize) {
      return false; // Backpressure
    }
    
    if (this.waitingResolvers.length > 0) {
      const resolve = this.waitingResolvers.shift()!;
      resolve({ value, done: false });
    } else {
      this.queue.push(value);
    }
    
    return true;
  }
  
  finish(): void {
    this.finished = true;
    
    // Resolve all waiting promises
    while (this.waitingResolvers.length > 0) {
      const resolve = this.waitingResolvers.shift()!;
      resolve({ value: undefined, done: true });
    }
  }
  
  getQueueSize(): number {
    return this.queue.length;
  }
}

// Performance monitoring decorator
export function performanceMonitor(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    
    try {
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;
      
      // Log performance data (can be enhanced to send to monitoring service)
      console.debug(`${target.constructor.name}.${propertyKey} took ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.debug(`${target.constructor.name}.${propertyKey} failed after ${duration.toFixed(2)}ms`);
      throw error;
    }
  };
  
  return descriptor;
}

// Memory-efficient string interning
export class StringInterner {
  private internMap = new Map<string, string>();
  
  intern(str: string): string {
    const existing = this.internMap.get(str);
    if (existing) {
      return existing;
    }
    
    this.internMap.set(str, str);
    return str;
  }
  
  clear(): void {
    this.internMap.clear();
  }
  
  getStats(): { interned: number; memoryEstimate: string } {
    const count = this.internMap.size;
    const avgLength = Array.from(this.internMap.keys())
      .reduce((sum, key) => sum + key.length, 0) / count;
    
    return {
      interned: count,
      memoryEstimate: `~${Math.round(count * avgLength * 2 / 1024)}KB`
    };
  }
}

// Optimized embedding operations
export class EmbeddingOptimizer {
  private static embeddingCache = new PerformanceCache<number[]>(1000, 600000); // 10min TTL
  private static batchProcessor = new BatchProcessor<string, number[]>(
    async (texts: string[]) => {
      // Batch generate embeddings (mock implementation)
      return texts.map(text => {
        // This would call actual embedding service in batches
        return Array.from({ length: 384 }, () => Math.random());
      });
    },
    20, // Batch size
    50  // 50ms flush interval
  );
  
  static async getEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cached = this.embeddingCache.get(text);
    if (cached) {
      return cached;
    }
    
    // Process through batch processor
    const embedding = await this.batchProcessor.process(text);
    
    // Cache result
    this.embeddingCache.set(text, embedding);
    
    return embedding;
  }
  
  static getCacheStats() {
    return this.embeddingCache.getStats();
  }
}
