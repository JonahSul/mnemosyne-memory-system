/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Vector Utilities
 *
 * Common vector operations and utilities for embedding management
 * Provides standardized vector processing and similarity calculations
 */
export interface VectorConfig {
    dimensions: number;
    distanceMetric: 'cosine' | 'euclidean' | 'dotProduct';
    normalization: boolean;
}
export interface VectorEntry {
    id: string;
    vector: number[];
    metadata?: Record<string, any>;
    timestamp?: number;
}
export interface VectorSearchResult {
    id: string;
    score: number;
    metadata?: Record<string, any>;
}
export interface VectorSearchOptions {
    limit?: number;
    threshold?: number;
    includeMetadata?: boolean;
    filter?: Record<string, any>;
}
/**
 * Utility class for vector operations
 */
export declare class VectorUtil {
    /**
     * Calculate cosine similarity between two vectors
     */
    static cosineSimilarity(a: number[], b: number[]): number;
    /**
     * Calculate euclidean distance between two vectors
     */
    static euclideanDistance(a: number[], b: number[]): number;
    /**
     * Calculate dot product between two vectors
     */
    static dotProduct(a: number[], b: number[]): number;
    /**
     * Normalize a vector to unit length
     */
    static normalize(vector: number[]): number[];
    /**
     * Calculate vector magnitude (norm)
     */
    static magnitude(vector: number[]): number;
    /**
     * Add two vectors element-wise
     */
    static add(a: number[], b: number[]): number[];
    /**
     * Subtract two vectors element-wise
     */
    static subtract(a: number[], b: number[]): number[];
    /**
     * Scale a vector by a scalar
     */
    static scale(vector: number[], scalar: number): number[];
    /**
     * Calculate average of multiple vectors
     */
    static average(vectors: number[][]): number[];
    /**
     * Find k-nearest neighbors using specified distance metric
     */
    static findKNearest(query: number[], candidates: VectorEntry[], k: number, metric?: 'cosine' | 'euclidean' | 'dotProduct'): VectorSearchResult[];
    /**
     * Check if a vector has valid dimensions and values
     */
    static isValidVector(vector: any, expectedDimensions?: number): boolean;
    /**
     * Generate a random vector for testing purposes
     */
    static generateRandomVector(dimensions: number, normalize?: boolean): number[];
    /**
     * Convert vector to a compact string representation
     */
    static vectorToString(vector: number[], precision?: number): string;
    /**
     * Parse vector from string representation
     */
    static vectorFromString(str: string): number[];
    /**
     * Calculate centroid of a set of vectors
     */
    static centroid(vectors: number[][]): number[];
    /**
     * Compute variance of vectors around their centroid
     */
    static variance(vectors: number[][]): number;
}
//# sourceMappingURL=VectorUtil.d.ts.map