/**
 * Enhanced Memory Interfaces for Foundation v1.7.1
 *
 * Structured semantic expansion with reduced cognitive complexity
 */
// TEMPORAL UTILITIES FOR SERVER-SIDE TIMESTAMP GENERATION
export class TemporalUtils {
    static sequenceCounter = 0;
    static lastTimestamp = 0;
    /**
     * Generate high-precision UNIX timestamp with microsecond resolution
     * Ensures monotonic ordering even for same-microsecond events
     */
    static generateServerTimestamp() {
        // Get current time in microseconds
        const now = Date.now() * 1000 + Math.floor(performance.now() % 1000);
        // Ensure monotonic ordering
        if (now <= this.lastTimestamp) {
            this.sequenceCounter++;
            return this.lastTimestamp + this.sequenceCounter;
        }
        else {
            this.lastTimestamp = now;
            this.sequenceCounter = 0;
            return now;
        }
    }
    /**
     * Create complete temporal metadata for memory entry
     */
    static createTemporalMetadata(clientTimestamp) {
        const serverTimestamp = this.generateServerTimestamp();
        const processingLatency = clientTimestamp
            ? Math.abs(serverTimestamp - clientTimestamp * 1000) // Convert client ms to microseconds
            : undefined;
        return {
            serverTimestamp,
            clientTimestamp: clientTimestamp ? clientTimestamp * 1000 : undefined,
            processingLatency,
            clockSource: "server", // Could be enhanced to detect NTP/atomic clock availability
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            sequenceNumber: this.sequenceCounter
        };
    }
    /**
     * Convert microsecond timestamp to ISO string for backward compatibility
     */
    static microsToISOString(microseconds) {
        const milliseconds = Math.floor(microseconds / 1000);
        const microPart = microseconds % 1000;
        const date = new Date(milliseconds);
        const isoString = date.toISOString();
        // Insert microseconds before the 'Z'
        return isoString.slice(0, -1) + microPart.toString().padStart(3, '0') + 'Z';
    }
    /**
     * Parse ISO string back to microsecond timestamp
     */
    static isoStringToMicros(isoString) {
        // Extract microseconds if present
        const microMatch = isoString.match(/\.(\d{6})Z$/);
        const microseconds = microMatch ? parseInt(microMatch[1] || "0") : 0;
        // Parse main timestamp
        const cleanIso = isoString.replace(/\.\d{6}Z$/, '.000Z');
        const milliseconds = new Date(cleanIso).getTime();
        return milliseconds * 1000 + microseconds;
    }
    /**
     * Calculate time difference in microseconds
     */
    static timeDifferenceMicros(timestamp1, timestamp2) {
        return Math.abs(timestamp1 - timestamp2);
    }
    /**
     * Format microsecond timestamp for human readability
     */
    static formatHumanReadable(microseconds, includeMs = true) {
        const date = new Date(Math.floor(microseconds / 1000));
        const microPart = microseconds % 1000;
        if (includeMs) {
            return `${date.toISOString().slice(0, -1)}${microPart.toString().padStart(3, '0')}Z`;
        }
        else {
            return date.toISOString();
        }
    }
}
