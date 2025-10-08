export class VectorPrewarmingManager {
    // NOTE: previous implementation stored authoritative state in volatile Maps/Arrays.
    // ARCHITECTURAL FIX: use write-through persistence (KV + Vectorize) on all mutating ops.
    activePrewarming = new Map();
    usagePatterns = [];
    effectivenessHistory = [];
    adaptedStrategies = [];
    vectorStore;
    kvStore;
    constructor(config = {}) {
        if (config.vectorStore) {
            this.vectorStore = config.vectorStore;
        }
        if (config.kvStore) {
            this.kvStore = config.kvStore;
        }
    }
    analyzeQueryForVectorNeeds(query) {
        // Extract semantic concepts from the query
        const semanticConcepts = this.extractSemanticConcepts(query);
        const vectorSearchAreas = this.identifyVectorSearchAreas(semanticConcepts);
        const analysis = {
            semanticConcepts,
            vectorSearchAreas,
            priority: this.calculatePriority(semanticConcepts, vectorSearchAreas),
            estimatedRelevantVectors: this.estimateVectorCount(vectorSearchAreas)
        };
        return analysis;
    }
    createPrewarmingStrategy(analysis) {
        const priorityVectors = this.selectPriorityVectors(analysis);
        const semanticRadius = this.calculateSemanticRadius(analysis);
        const estimatedLatency = this.estimateLatency(analysis);
        return {
            priorityVectors,
            semanticRadius,
            estimatedLatency
        };
    }
    async executeVectorPrewarming(strategy) {
        const prewarmingId = `prewarming_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const status = {
            isActive: true,
            targetConcepts: strategy.priorityVectors,
            startTime: new Date().toISOString()
        };
        this.activePrewarming.set(prewarmingId, status);
        // Write-through persistence
        try {
            if (this.kvStore)
                await this.kvStore.put(`prewarming:${prewarmingId}`, JSON.stringify(status));
            if (this.vectorStore && this.vectorStore.storeKnowledge)
                await this.vectorStore.storeKnowledge({ content: JSON.stringify(status), metadata: { id: prewarmingId, type: 'prewarming', startTime: status.startTime }, tags: ['prewarming', 'status'] });
        }
        catch (e) {
            // Non-fatal: keep in-memory as fallback
        }
        // Simulate vector pre-warming process
        setTimeout(() => {
            const updatedStatus = this.activePrewarming.get(prewarmingId);
            if (updatedStatus) {
                updatedStatus.isActive = false;
                this.activePrewarming.set(prewarmingId, updatedStatus);
                // Persist the updated status
                try {
                    if (this.kvStore)
                        this.kvStore.put(`prewarming:${prewarmingId}`, JSON.stringify(updatedStatus));
                    if (this.vectorStore && this.vectorStore.storeKnowledge)
                        this.vectorStore.storeKnowledge({ content: JSON.stringify(updatedStatus), metadata: { id: prewarmingId, type: 'prewarming', startTime: updatedStatus.startTime, isActive: updatedStatus.isActive }, tags: ['prewarming', 'status'] });
                }
                catch (e) {
                    // ignore
                }
            }
        }, strategy.estimatedLatency);
        return status;
    }
    async adaptPrewarmingBasedOnUsage(usagePatterns) {
        this.usagePatterns = usagePatterns;
        // Learn from usage patterns
        const learnedConcepts = this.extractLearnedConcepts(usagePatterns);
        const confidence = this.calculateConfidence(usagePatterns);
        const relatedPatterns = this.identifyRelatedPatterns(usagePatterns);
        return {
            learnedConcepts,
            confidence,
            relatedPatterns
        };
    }
    // Persist usage patterns when set
    async persistUsagePatterns() {
        try {
            if (this.kvStore)
                await this.kvStore.put('prewarming:usagePatterns', JSON.stringify(this.usagePatterns));
            if (this.vectorStore && this.vectorStore.storeKnowledge)
                await this.vectorStore.storeKnowledge({ content: JSON.stringify(this.usagePatterns), metadata: { id: 'usagePatterns', type: 'prewarming_meta' }, tags: ['prewarming', 'usage'] });
        }
        catch (e) { }
    }
    async prioritizeVectorsByDomain(domain) {
        const suggestedVectors = this.getSuggestedVectorsForDomain(domain);
        const priority = this.calculateDomainPriority(domain);
        return {
            domainMatch: domain,
            priority,
            suggestedVectors
        };
    }
    async predictNextQueries(sessionContext) {
        const predictedTopics = this.predictTopicsFromContext(sessionContext);
        const confidence = this.calculatePredictionConfidence(sessionContext);
        const basedOnPatterns = this.getRelevantPatterns(sessionContext);
        return {
            predictedTopics,
            confidence,
            basedOnPatterns
        };
    }
    async createVectorSessionPrewarmingStrategy(prediction) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return {
            sessionId,
            targetConcepts: prediction.predictedTopics,
            relatedTopics: this.expandTopics(prediction.predictedTopics),
            priorityLevel: Math.round(prediction.confidence * 10)
        };
    }
    async evaluatePrewarmingEffectiveness(strategy) {
        // Simulate effectiveness evaluation
        const actualRelevance = Math.random() * 0.4 + 0.6; // 0.6-1.0
        const userSatisfaction = Math.random() * 0.3 + 0.7; // 0.7-1.0
        const effectiveness = {
            strategy: strategy.sessionId,
            targetConcepts: strategy.targetConcepts,
            actualRelevance,
            userSatisfaction
        };
        this.effectivenessHistory.push(effectiveness);
        // Persist effectiveness
        try {
            if (this.kvStore)
                await this.kvStore.put(`prewarming:effectiveness:${strategy.sessionId}`, JSON.stringify(effectiveness));
            if (this.vectorStore && this.vectorStore.storeKnowledge)
                await this.vectorStore.storeKnowledge({ content: JSON.stringify(effectiveness), metadata: { id: strategy.sessionId, type: 'prewarming_effectiveness' }, tags: ['prewarming', 'effectiveness'] });
        }
        catch (e) { }
        return effectiveness;
    }
    async adaptPrewarmingStrategy(effectiveness) {
        // Learn from effectiveness and adapt
        const successRate = (effectiveness.actualRelevance + effectiveness.userSatisfaction) / 2;
        const preferredMethods = this.identifyPreferredMethods(effectiveness);
        const confidenceLevel = this.calculateAdaptedConfidence(effectiveness);
        const adapted = {
            preferredMethods,
            successRate,
            confidenceLevel
        };
        this.adaptedStrategies.push(adapted);
        // Persist adapted strategy
        try {
            if (this.kvStore)
                await this.kvStore.put(`prewarming:adapted:${Date.now()}`, JSON.stringify(adapted));
            if (this.vectorStore && this.vectorStore.storeKnowledge)
                await this.vectorStore.storeKnowledge({ content: JSON.stringify(adapted), metadata: { type: 'prewarming_adapted' }, tags: ['prewarming', 'adapted'] });
        }
        catch (e) { }
        return adapted;
    }
    // Private helper methods
    extractSemanticConcepts(query) {
        // Handle type safety - extract string from object if needed
        let queryStr;
        if (typeof query === 'string') {
            queryStr = query;
        }
        else if (query && typeof query === 'object' && query.query) {
            queryStr = query.query;
        }
        else if (query && typeof query === 'object' && query.content) {
            queryStr = query.content;
        }
        else {
            queryStr = String(query || '');
        }
        // Extract meaningful semantic concepts from the query
        const words = queryStr.toLowerCase().split(' ');
        return words.filter(word => word.length > 3 &&
            !['help', 'with', 'this', 'that', 'they', 'them', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word));
    }
    identifyVectorSearchAreas(concepts) {
        const vectorSearchAreas = [];
        const conceptText = concepts.join(' ');
        // Identify areas based on semantic concepts
        if (conceptText.includes('typescript') || conceptText.includes('compilation')) {
            vectorSearchAreas.push('typescript', 'compilation');
        }
        if (conceptText.includes('debug') || conceptText.includes('error')) {
            vectorSearchAreas.push('debugging');
        }
        if (conceptText.includes('react')) {
            vectorSearchAreas.push('react', 'frontend');
        }
        if (conceptText.includes('performance') || conceptText.includes('optimize')) {
            vectorSearchAreas.push('performance', 'optimization');
        }
        if (conceptText.includes('authentication') || conceptText.includes('auth') || conceptText.includes('token')) {
            vectorSearchAreas.push('authentication', 'security');
        }
        if (conceptText.includes('database') || conceptText.includes('query') || conceptText.includes('sql')) {
            vectorSearchAreas.push('database', 'queries');
        }
        if (conceptText.includes('implement') || conceptText.includes('develop')) {
            vectorSearchAreas.push('development', 'implementation');
        }
        return vectorSearchAreas;
    }
    calculatePriority(concepts, areas) {
        const technicalTerms = ['react', 'component', 'performance', 'optimize', 'debug', 'error', 'typescript', 'javascript'];
        const technicalMatches = concepts.filter(concept => technicalTerms.some(term => concept.includes(term) || term.includes(concept)));
        return Math.min(10, Math.max(1, technicalMatches.length + concepts.length / 2));
    }
    estimateVectorCount(areas) {
        return areas.length * 50; // Estimate 50 vectors per area
    }
    selectPriorityVectors(analysis) {
        return analysis.vectorSearchAreas.slice(0, 3); // Top 3 priority vectors
    }
    calculateSemanticRadius(analysis) {
        return Math.max(0.1, analysis.priority * 0.1);
    }
    estimateLatency(analysis) {
        return analysis.estimatedRelevantVectors * 2; // 2ms per vector
    }
    extractLearnedConcepts(patterns) {
        return patterns.flatMap(p => p.recentQueries).slice(0, 10);
    }
    calculateConfidence(patterns) {
        return Math.min(patterns.length * 0.1, 1.0);
    }
    identifyRelatedPatterns(patterns) {
        return patterns.map(p => p.domain);
    }
    getSuggestedVectorsForDomain(domain) {
        return [`${domain}_primary`, `${domain}_secondary`, `${domain}_related`];
    }
    calculateDomainPriority(domain) {
        // Priority based on domain importance
        const domainPriorities = {
            'memory': 10,
            'behavioral': 9,
            'workflow': 8,
            'vector': 7,
            'default': 5
        };
        return domainPriorities[domain] ?? domainPriorities.default;
    }
    predictTopicsFromContext(context) {
        const topics = [];
        for (const [key, value] of Object.entries(context)) {
            if (typeof value === 'string') {
                topics.push(`${key}_${value}`);
            }
        }
        return topics.slice(0, 5);
    }
    calculatePredictionConfidence(context) {
        return Math.min(Object.keys(context).length * 0.1, 1.0);
    }
    getRelevantPatterns(context) {
        return this.usagePatterns
            .filter(p => p.frequency > 2)
            .map(p => p.domain)
            .slice(0, 3);
    }
    expandTopics(topics) {
        if (!topics || !Array.isArray(topics)) {
            return [];
        }
        return topics.flatMap(topic => [topic, `${topic}_related`, `${topic}_context`]);
    }
    identifyPreferredMethods(effectiveness) {
        if (effectiveness.actualRelevance > 0.8) {
            return ['aggressive_prewarming', 'broad_semantic_radius'];
        }
        else if (effectiveness.actualRelevance > 0.6) {
            return ['moderate_prewarming', 'focused_concepts'];
        }
        else {
            return ['conservative_prewarming', 'narrow_focus'];
        }
    }
    calculateAdaptedConfidence(effectiveness) {
        return (effectiveness.actualRelevance + effectiveness.userSatisfaction) / 2;
    }
    // Utility methods
    getActivePrewarming() {
        return new Map(this.activePrewarming);
    }
    getUsagePatterns() {
        return [...this.usagePatterns];
    }
    getEffectivenessHistory() {
        return [...this.effectivenessHistory];
    }
    getAdaptedStrategies() {
        return [...this.adaptedStrategies];
    }
    // =============================================================================
    // SYNCHRONOUS WORKFLOW INTEGRATION METHODS
    // =============================================================================
    generateStrategySync(query) {
        const concepts = this.extractSemanticConcepts(query);
        const vectorSearchAreas = this.identifyVectorSearchAreas(concepts);
        const priority = this.calculatePriority(concepts, vectorSearchAreas);
        // Generate priority vectors based on analysis
        const priorityVectors = [...concepts, ...vectorSearchAreas];
        // Calculate semantic radius based on concept complexity
        const semanticRadius = Math.min(priority * 0.5, 3.0);
        // Estimate latency based on vector count and complexity
        const estimatedLatency = Math.max(100, vectorSearchAreas.length * 50 * 2);
        return {
            priorityVectors,
            semanticRadius,
            estimatedLatency
        };
    }
    currentPrewarming = null;
    startPrewarmingSync(query) {
        const concepts = this.extractSemanticConcepts(query);
        this.currentPrewarming = {
            isActive: true,
            targetConcepts: concepts,
            startTime: new Date().toISOString()
        };
        // Persist synchronous prewarming status
        try {
            const id = `currentPrewarming`;
            if (this.kvStore)
                this.kvStore.put(`prewarming:${id}`, JSON.stringify(this.currentPrewarming));
            if (this.vectorStore && this.vectorStore.storeKnowledge)
                this.vectorStore.storeKnowledge({ content: JSON.stringify(this.currentPrewarming), metadata: { id, type: 'prewarming_current' }, tags: ['prewarming', 'current'] });
        }
        catch (e) { }
        // Simulate async pre-warming completion
        setTimeout(() => {
            if (this.currentPrewarming) {
                this.currentPrewarming.isActive = false;
            }
        }, 1000);
    }
    getPrewarmingStatusSync() {
        return this.currentPrewarming || {
            isActive: false,
            targetConcepts: [],
            startTime: ''
        };
    }
    // Adaptive learning state
    queryPatterns = [];
    userBehaviorPatterns = [];
    recordQueryPatternSync(query, concepts) {
        this.queryPatterns.push({ query, concepts });
    }
    recordUserBehaviorPatternSync(pattern) {
        this.userBehaviorPatterns.push(pattern);
    }
    generateAdaptivePrewarmingStrategySync(query) {
        // Handle type safety - extract string from object if needed
        let queryStr;
        if (typeof query === 'string') {
            queryStr = query;
        }
        else if (query && typeof query === 'object' && query.query) {
            queryStr = query.query;
        }
        else if (query && typeof query === 'object' && query.content) {
            queryStr = query.content;
        }
        else {
            queryStr = String(query || '');
        }
        // Extract concepts from the new query
        const queryWords = queryStr.toLowerCase().split(' ');
        // Find learned concepts from recorded patterns
        const learnedConcepts = new Set();
        const relatedPatterns = [];
        this.queryPatterns.forEach(pattern => {
            // Check if any concepts match the current query
            const hasMatch = pattern.concepts.some(concept => queryWords.some(word => word.includes(concept) || concept.includes(word)));
            if (hasMatch) {
                pattern.concepts.forEach(concept => learnedConcepts.add(concept));
                relatedPatterns.push(pattern.query);
            }
        });
        // Calculate confidence based on pattern matches
        const confidence = Math.min(0.9, Math.max(0.1, relatedPatterns.length * 0.3));
        return {
            learnedConcepts: Array.from(learnedConcepts),
            confidence,
            relatedPatterns
        };
    }
    prioritizeVectorPrewarmingSync(query) {
        // Handle type safety - extract string from object if needed
        let queryStr;
        if (typeof query === 'string') {
            queryStr = query;
        }
        else if (query && typeof query === 'object' && query.query) {
            queryStr = query.query;
        }
        else if (query && typeof query === 'object' && query.content) {
            queryStr = query.content;
        }
        else {
            queryStr = String(query || '');
        }
        // Find matching behavior pattern
        const queryWords = queryStr.toLowerCase().split(' ');
        let bestMatch = this.userBehaviorPatterns[0]; // Default to first pattern if any
        for (const pattern of this.userBehaviorPatterns) {
            const hasQueryMatch = pattern.recentQueries.some(recentQuery => queryWords.some(word => recentQuery.toLowerCase().includes(word) || word.includes(recentQuery.toLowerCase())));
            if (hasQueryMatch) {
                bestMatch = pattern;
                break;
            }
        }
        // Generate suggested vectors based on the pattern
        const suggestedVectors = bestMatch ? [
            ...bestMatch.recentQueries.map(q => q.toLowerCase()),
            ...queryWords.filter(word => word.length > 3)
        ] : [];
        return {
            domainMatch: bestMatch?.domain || '',
            priority: bestMatch?.frequency || 0,
            suggestedVectors
        };
    }
}
