/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Vector Utilities
 *
 * Common vector operations and utilities for embedding management
 * Provides standardized vector processing and similarity calculations
 */
/**
 * Utility class for vector operations
 */
export class VectorUtil {
    /**
     * Calculate cosine similarity between two vectors
     */
    static cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same dimensions');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            const aVal = a[i];
            const bVal = b[i];
            if (aVal === undefined || bVal === undefined) {
                throw new Error('Vector contains undefined values');
            }
            dotProduct += aVal * bVal;
            normA += aVal * aVal;
            normB += bVal * bVal;
        }
        if (normA === 0 || normB === 0) {
            return 0;
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * Calculate euclidean distance between two vectors
     */
    static euclideanDistance(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same dimensions');
        }
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            const aVal = a[i];
            const bVal = b[i];
            if (aVal === undefined || bVal === undefined) {
                throw new Error('Vector contains undefined values');
            }
            const diff = aVal - bVal;
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
    /**
     * Calculate dot product between two vectors
     */
    static dotProduct(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same dimensions');
        }
        let product = 0;
        for (let i = 0; i < a.length; i++) {
            const aVal = a[i];
            const bVal = b[i];
            if (aVal === undefined || bVal === undefined) {
                throw new Error('Vector contains undefined values');
            }
            product += aVal * bVal;
        }
        return product;
    }
    /**
     * Normalize a vector to unit length
     */
    static normalize(vector) {
        const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        if (norm === 0) {
            return vector.slice(); // Return copy of zero vector
        }
        return vector.map(val => val / norm);
    }
    /**
     * Calculate vector magnitude (norm)
     */
    static magnitude(vector) {
        return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    }
    /**
     * Add two vectors element-wise
     */
    static add(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same dimensions');
        }
        return a.map((val, i) => {
            const bVal = b[i];
            if (bVal === undefined) {
                throw new Error('Vector contains undefined values');
            }
            return val + bVal;
        });
    }
    /**
     * Subtract two vectors element-wise
     */
    static subtract(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same dimensions');
        }
        return a.map((val, i) => {
            const bVal = b[i];
            if (bVal === undefined) {
                throw new Error('Vector contains undefined values');
            }
            return val - bVal;
        });
    }
    /**
     * Scale a vector by a scalar
     */
    static scale(vector, scalar) {
        return vector.map(val => val * scalar);
    }
    /**
     * Calculate average of multiple vectors
     */
    static average(vectors) {
        if (vectors.length === 0) {
            throw new Error('Cannot average empty vector array');
        }
        const firstVector = vectors[0];
        if (!firstVector) {
            throw new Error('First vector is undefined');
        }
        const dimensions = firstVector.length;
        const result = new Array(dimensions).fill(0);
        for (const vector of vectors) {
            if (vector.length !== dimensions) {
                throw new Error('All vectors must have the same dimensions');
            }
            for (let i = 0; i < dimensions; i++) {
                result[i] += vector[i];
            }
        }
        return result.map(val => val / vectors.length);
    }
    /**
     * Find k-nearest neighbors using specified distance metric
     */
    static findKNearest(query, candidates, k, metric = 'cosine') {
        const results = [];
        for (const candidate of candidates) {
            let score;
            switch (metric) {
                case 'cosine':
                    score = this.cosineSimilarity(query, candidate.vector);
                    break;
                case 'euclidean':
                    // Convert distance to similarity (higher is better)
                    score = 1 / (1 + this.euclideanDistance(query, candidate.vector));
                    break;
                case 'dotProduct':
                    score = this.dotProduct(query, candidate.vector);
                    break;
                default:
                    throw new Error(`Unsupported distance metric: ${metric}`);
            }
            const result = {
                id: candidate.id,
                score
            };
            if (candidate.metadata !== undefined) {
                result.metadata = candidate.metadata;
            }
            results.push(result);
        }
        // Sort by score (descending) and take top k
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, k);
    }
    /**
     * Check if a vector has valid dimensions and values
     */
    static isValidVector(vector, expectedDimensions) {
        if (!Array.isArray(vector)) {
            return false;
        }
        if (expectedDimensions !== undefined && vector.length !== expectedDimensions) {
            return false;
        }
        return vector.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val));
    }
    /**
     * Generate a random vector for testing purposes
     */
    static generateRandomVector(dimensions, normalize = false) {
        const vector = Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
        return normalize ? this.normalize(vector) : vector;
    }
    /**
     * Convert vector to a compact string representation
     */
    static vectorToString(vector, precision = 6) {
        return vector.map(val => val.toFixed(precision)).join(',');
    }
    /**
     * Parse vector from string representation
     */
    static vectorFromString(str) {
        return str.split(',').map(val => parseFloat(val));
    }
    /**
     * Calculate centroid of a set of vectors
     */
    static centroid(vectors) {
        return this.average(vectors);
    }
    /**
     * Compute variance of vectors around their centroid
     */
    static variance(vectors) {
        if (vectors.length <= 1) {
            return 0;
        }
        const centroid = this.centroid(vectors);
        const squaredDistances = vectors.map(vector => {
            const distance = this.euclideanDistance(vector, centroid);
            return distance * distance;
        });
        return squaredDistances.reduce((sum, dist) => sum + dist, 0) / vectors.length;
    }
}
