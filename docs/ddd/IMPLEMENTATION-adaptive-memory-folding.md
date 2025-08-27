# Adaptive Memory Folding - Complete Implementation Plan

## Overview

This document provides a complete function-level implementation plan for the Adaptive Memory Folding system with behavioral intervention capabilities, including the enhanced `stop` strategy for direct protocol violation notification.

## File Structure

```text
src/
├── behavioral/
│   ├── AgentPerformanceTracker.ts
│   ├── BehavioralAnalysisService.ts
│   ├── FoldingStrategyEngine.ts
│   ├── ResultModificationPipeline.ts
│   └── types.ts
├── memory/
│   └── simplified-registry.ts (extended)
└── utils/
    └── behavioral-utils.ts
```

## Type Definitions

### `src/behavioral/types.ts`

```typescript
export interface AgentBehavioralProfile {
  agentId: string;
  focusScore: number; // 0-1, search pattern coherence
  stabilityScore: number; // 0-1, behavioral consistency
  cognitiveLoad: number; // 0-1, processing overhead
  violationFrequency: number; // 0-1, protocol deviation rate
  lastViolationTimestamp: Date;
  behavioralTrend: 'improving' | 'declining' | 'stable';
  sessionStartTime: Date;
  totalInteractions: number;
  recentViolations: ProtocolViolation[];
}

export interface ProtocolViolation {
  id: string;
  timestamp: Date;
  violationType: 'search_abuse' | 'pattern_deviation' | 'cognitive_overload' | 'stability_breach';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  agentId: string;
}

export interface BehavioralMetrics {
  searchPatternCoherence: number;
  responseStability: number;
  processingEfficiency: number;
  protocolCompliance: number;
  sessionDuration: number;
}

export interface ThresholdConfiguration {
  exploration: number;
  recall: number;
  precision: number;
  prewarming: number;
  resultLimit: number;
}

export interface ResultFilter {
  filterType: 'confidence' | 'relevance' | 'stability' | 'focus';
  threshold: number;
  operation: 'greater_than' | 'less_than' | 'equal_to';
}

export interface FoldingStrategy {
  name: 'calm' | 'focus' | 'stabilize' | 'stop' | 'standard';
  thresholdAdjustments: ThresholdConfiguration;
  resultModifications: ResultFilter[];
  guidanceTemplate: string;
  severity: 'subtle' | 'moderate' | 'direct' | 'intervention';
  interventionLevel: number; // 1-5, escalation level
}

export interface ModifiedSearchResult {
  originalResults: MemorySearchResult[];
  filteredResults: MemorySearchResult[];
  guidance: string;
  strategy: FoldingStrategy;
  systemAlert: boolean;
  interventionRequired: boolean;
  metadata: {
    resultsModified: boolean;
    guidanceInjected: boolean;
    strategyApplied: string;
    behavioralContext: AgentBehavioralProfile;
  };
}

export interface SearchContext {
  query: string;
  searchType: string;
  timestamp: Date;
  sessionId: string;
  previousSearches: string[];
}

export interface BehavioralEvent {
  id: string;
  agentId: string;
  eventType: 'search' | 'violation' | 'recovery' | 'intervention';
  timestamp: Date;
  context: Record<string, any>;
  impact: 'positive' | 'negative' | 'neutral';
}
```

## Core Implementation

### `src/behavioral/AgentPerformanceTracker.ts`

```typescript
import { AgentBehavioralProfile, BehavioralMetrics, ProtocolViolation, SearchContext, BehavioralEvent } from './types';

export class AgentPerformanceTracker {
  private profiles: Map<string, AgentBehavioralProfile> = new Map();
  private violations: Map<string, ProtocolViolation[]> = new Map();
  private searchHistory: Map<string, SearchContext[]> = new Map();
  private behavioralEvents: Map<string, BehavioralEvent[]> = new Map();

  /**
   * Track behavioral metrics for an agent during a search operation
   */
  async trackBehavioralMetrics(agentId: string, searchContext: SearchContext): Promise<void> {
    const profile = await this.getOrCreateProfile(agentId);
    const metrics = await this.calculateMetrics(agentId, searchContext);
    
    // Update profile with new metrics
    profile.focusScore = this.updateMovingAverage(profile.focusScore, metrics.searchPatternCoherence, 0.3);
    profile.stabilityScore = this.updateMovingAverage(profile.stabilityScore, metrics.responseStability, 0.3);
    profile.cognitiveLoad = this.updateMovingAverage(profile.cognitiveLoad, metrics.processingEfficiency, 0.2);
    profile.violationFrequency = metrics.protocolCompliance;
    profile.totalInteractions += 1;
    
    // Update behavioral trend
    profile.behavioralTrend = this.calculateBehavioralTrend(agentId);
    
    // Store search history
    this.addSearchHistory(agentId, searchContext);
    
    // Detect and record violations
    await this.detectViolations(agentId, searchContext, metrics);
    
    // Store updated profile
    this.profiles.set(agentId, profile);
  }

  /**
   * Calculate focus score based on search pattern coherence
   */
  calculateFocusScore(searchHistory: SearchContext[]): number {
    if (searchHistory.length < 2) return 1.0;

    let coherenceSum = 0;
    let comparisons = 0;

    for (let i = 1; i < searchHistory.length; i++) {
      const current = searchHistory[i];
      const previous = searchHistory[i - 1];
      
      // Calculate semantic similarity between consecutive searches
      const similarity = this.calculateSemanticSimilarity(current.query, previous.query);
      
      // Check time gap (rapid successive searches indicate scattered attention)
      const timeGap = current.timestamp.getTime() - previous.timestamp.getTime();
      const timeScore = Math.min(timeGap / 30000, 1.0); // 30 seconds optimal gap
      
      coherenceSum += (similarity * 0.7) + (timeScore * 0.3);
      comparisons++;
    }

    return comparisons > 0 ? coherenceSum / comparisons : 1.0;
  }

  /**
   * Calculate stability score based on behavioral consistency
   */
  calculateStabilityScore(behavioralHistory: BehavioralEvent[]): number {
    if (behavioralHistory.length < 5) return 1.0;

    const recentEvents = behavioralHistory.slice(-10);
    let stabilitySum = 0;
    let eventCount = 0;

    for (const event of recentEvents) {
      switch (event.eventType) {
        case 'search':
          stabilitySum += event.impact === 'positive' ? 1.0 : 
                        event.impact === 'neutral' ? 0.7 : 0.3;
          break;
        case 'violation':
          stabilitySum += 0.1;
          break;
        case 'recovery':
          stabilitySum += 0.9;
          break;
        case 'intervention':
          stabilitySum += 0.5;
          break;
      }
      eventCount++;
    }

    return eventCount > 0 ? stabilitySum / eventCount : 1.0;
  }

  /**
   * Assess violation frequency based on recent protocol deviations
   */
  assessViolationFrequency(violations: ProtocolViolation[]): number {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    const recentViolations = violations.filter(v => v.timestamp >= oneHourAgo);
    
    if (recentViolations.length === 0) return 0.0;
    
    // Weight by severity
    let severityScore = 0;
    for (const violation of recentViolations) {
      switch (violation.severity) {
        case 'minor': severityScore += 0.2; break;
        case 'moderate': severityScore += 0.5; break;
        case 'severe': severityScore += 1.0; break;
      }
    }
    
    // Normalize by time and maximum possible violations
    return Math.min(severityScore / 10, 1.0);
  }

  /**
   * Get behavioral profile for an agent
   */
  async getBehavioralProfile(agentId: string): Promise<AgentBehavioralProfile> {
    return this.getOrCreateProfile(agentId);
  }

  /**
   * Record a protocol violation
   */
  async recordViolation(violation: ProtocolViolation): Promise<void> {
    const agentViolations = this.violations.get(violation.agentId) || [];
    agentViolations.push(violation);
    this.violations.set(violation.agentId, agentViolations);

    // Update agent profile
    const profile = await this.getOrCreateProfile(violation.agentId);
    profile.recentViolations = agentViolations.slice(-10); // Keep last 10
    profile.lastViolationTimestamp = violation.timestamp;
    profile.violationFrequency = this.assessViolationFrequency(agentViolations);
    
    this.profiles.set(violation.agentId, profile);
  }

  /**
   * Get or create agent profile
   */
  private async getOrCreateProfile(agentId: string): Promise<AgentBehavioralProfile> {
    if (!this.profiles.has(agentId)) {
      const profile: AgentBehavioralProfile = {
        agentId,
        focusScore: 1.0,
        stabilityScore: 1.0,
        cognitiveLoad: 0.0,
        violationFrequency: 0.0,
        lastViolationTimestamp: new Date(0),
        behavioralTrend: 'stable',
        sessionStartTime: new Date(),
        totalInteractions: 0,
        recentViolations: []
      };
      this.profiles.set(agentId, profile);
    }
    return this.profiles.get(agentId)!;
  }

  /**
   * Calculate comprehensive behavioral metrics
   */
  private async calculateMetrics(agentId: string, searchContext: SearchContext): Promise<BehavioralMetrics> {
    const searchHistory = this.searchHistory.get(agentId) || [];
    const behavioralHistory = this.behavioralEvents.get(agentId) || [];
    const violations = this.violations.get(agentId) || [];

    return {
      searchPatternCoherence: this.calculateFocusScore([...searchHistory, searchContext]),
      responseStability: this.calculateStabilityScore(behavioralHistory),
      processingEfficiency: this.calculateProcessingEfficiency(searchHistory),
      protocolCompliance: 1.0 - this.assessViolationFrequency(violations),
      sessionDuration: Date.now() - searchContext.timestamp.getTime()
    };
  }

  /**
   * Calculate processing efficiency based on search patterns
   */
  private calculateProcessingEfficiency(searchHistory: SearchContext[]): number {
    if (searchHistory.length < 2) return 1.0;

    const recentSearches = searchHistory.slice(-5);
    let efficiencySum = 0;

    for (let i = 1; i < recentSearches.length; i++) {
      const current = recentSearches[i];
      const previous = recentSearches[i - 1];
      
      // Time between searches (too fast = cognitive overload)
      const timeDiff = current.timestamp.getTime() - previous.timestamp.getTime();
      const timeScore = Math.min(timeDiff / 15000, 1.0); // 15 seconds minimum
      
      // Query complexity (too complex = overload)
      const complexityScore = Math.max(1.0 - (current.query.length / 500), 0.3);
      
      efficiencySum += (timeScore * 0.6) + (complexityScore * 0.4);
    }

    return recentSearches.length > 1 ? efficiencySum / (recentSearches.length - 1) : 1.0;
  }

  /**
   * Detect protocol violations based on metrics
   */
  private async detectViolations(agentId: string, searchContext: SearchContext, metrics: BehavioralMetrics): Promise<void> {
    const violations: ProtocolViolation[] = [];

    // Search abuse detection
    if (metrics.processingEfficiency < 0.3) {
      violations.push({
        id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        violationType: 'search_abuse',
        severity: 'moderate',
        description: 'Rapid successive searches detected (cognitive overload pattern)',
        agentId
      });
    }

    // Pattern deviation detection
    if (metrics.searchPatternCoherence < 0.4) {
      violations.push({
        id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        violationType: 'pattern_deviation',
        severity: 'minor',
        description: 'Search pattern lacks coherence (scattered attention)',
        agentId
      });
    }

    // Stability breach detection
    if (metrics.responseStability < 0.3) {
      violations.push({
        id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        violationType: 'stability_breach',
        severity: 'severe',
        description: 'Behavioral instability detected (erratic patterns)',
        agentId
      });
    }

    // Record violations
    for (const violation of violations) {
      await this.recordViolation(violation);
    }
  }

  /**
   * Calculate behavioral trend over time
   */
  private calculateBehavioralTrend(agentId: string): 'improving' | 'declining' | 'stable' {
    const profile = this.profiles.get(agentId);
    if (!profile || profile.totalInteractions < 5) return 'stable';

    const behavioralHistory = this.behavioralEvents.get(agentId) || [];
    const recentEvents = behavioralHistory.slice(-10);
    
    if (recentEvents.length < 5) return 'stable';

    let positiveCount = 0;
    let negativeCount = 0;

    for (const event of recentEvents) {
      if (event.impact === 'positive') positiveCount++;
      else if (event.impact === 'negative') negativeCount++;
    }

    const ratio = positiveCount / (positiveCount + negativeCount);
    
    if (ratio > 0.7) return 'improving';
    if (ratio < 0.3) return 'declining';
    return 'stable';
  }

  /**
   * Add search to history
   */
  private addSearchHistory(agentId: string, searchContext: SearchContext): void {
    const history = this.searchHistory.get(agentId) || [];
    history.push(searchContext);
    
    // Keep last 20 searches
    if (history.length > 20) {
      history.shift();
    }
    
    this.searchHistory.set(agentId, history);
  }

  /**
   * Calculate semantic similarity between two queries
   */
  private calculateSemanticSimilarity(query1: string, query2: string): number {
    // Simple word overlap for now - could be enhanced with embeddings
    const words1 = new Set(query1.toLowerCase().split(/\s+/));
    const words2 = new Set(query2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Update moving average with new value
   */
  private updateMovingAverage(current: number, newValue: number, alpha: number): number {
    return (alpha * newValue) + ((1 - alpha) * current);
  }
}
```

### `src/behavioral/BehavioralAnalysisService.ts`

```typescript
import { AgentBehavioralProfile, FoldingStrategy, ThresholdConfiguration } from './types';

export class BehavioralAnalysisService {
  private strategyCache: Map<string, { strategy: FoldingStrategy; timestamp: Date }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  /**
   * Analyze agent state and determine appropriate folding strategy
   */
  analyzeAgentState(profile: AgentBehavioralProfile): FoldingStrategy {
    // Check cache first
    const cached = this.strategyCache.get(profile.agentId);
    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_DURATION) {
      return cached.strategy;
    }

    const strategy = this.determineStrategy(profile);
    
    // Cache the strategy
    this.strategyCache.set(profile.agentId, {
      strategy,
      timestamp: new Date()
    });

    return strategy;
  }

  /**
   * Determine if intervention should be escalated
   */
  shouldEscalateIntervention(profile: AgentBehavioralProfile): boolean {
    return (
      profile.violationFrequency > 0.7 ||
      (profile.violationFrequency > 0.4 && profile.behavioralTrend === 'declining') ||
      profile.recentViolations.filter(v => v.severity === 'severe').length >= 2
    );
  }

  /**
   * Generate intervention message based on strategy and profile
   */
  generateInterventionMessage(strategy: FoldingStrategy, profile: AgentBehavioralProfile): string {
    const templates = this.getMessageTemplates();
    let baseMessage = templates[strategy.name] || templates.standard;

    // Personalize message based on profile
    baseMessage = this.personalizeMessage(baseMessage, profile, strategy);

    return baseMessage;
  }

  /**
   * Determine the appropriate folding strategy based on agent profile
   */
  private determineStrategy(profile: AgentBehavioralProfile): FoldingStrategy {
    // STOP strategy - highest priority
    if (this.shouldApplyStopStrategy(profile)) {
      return this.createStopStrategy(profile);
    }

    // STABILIZE strategy
    if (profile.stabilityScore < 0.4 && profile.violationFrequency < 0.5) {
      return this.createStabilizeStrategy();
    }

    // CALM strategy
    if (profile.cognitiveLoad > 0.7 && profile.focusScore < 0.6) {
      return this.createCalmStrategy();
    }

    // FOCUS strategy
    if (profile.focusScore < 0.5 && profile.stabilityScore > 0.6) {
      return this.createFocusStrategy();
    }

    // STANDARD strategy (default)
    return this.createStandardStrategy();
  }

  /**
   * Check if STOP strategy should be applied
   */
  private shouldApplyStopStrategy(profile: AgentBehavioralProfile): boolean {
    return (
      profile.violationFrequency > 0.5 ||
      (profile.violationFrequency > 0.3 && profile.behavioralTrend === 'declining') ||
      (profile.cognitiveLoad > 0.9 && profile.stabilityScore < 0.2) ||
      profile.recentViolations.filter(v => v.severity === 'severe').length >= 1
    );
  }

  /**
   * Create STOP strategy configuration
   */
  private createStopStrategy(profile: AgentBehavioralProfile): FoldingStrategy {
    const interventionLevel = this.calculateInterventionLevel(profile);
    
    return {
      name: 'stop',
      thresholdAdjustments: {
        exploration: 0.01,
        recall: 0.01,
        precision: 0.8,
        prewarming: 0.01,
        resultLimit: Math.max(2, 4 - interventionLevel)
      },
      resultModifications: [
        {
          filterType: 'confidence',
          threshold: 0.9,
          operation: 'greater_than'
        },
        {
          filterType: 'relevance',
          threshold: 0.8,
          operation: 'greater_than'
        }
      ],
      guidanceTemplate: 'stop_intervention',
      severity: 'intervention',
      interventionLevel
    };
  }

  /**
   * Create STABILIZE strategy configuration
   */
  private createStabilizeStrategy(): FoldingStrategy {
    return {
      name: 'stabilize',
      thresholdAdjustments: {
        exploration: 0.03,
        recall: 0.05,
        precision: 0.4,
        prewarming: 0.02,
        resultLimit: 5
      },
      resultModifications: [
        {
          filterType: 'stability',
          threshold: 0.7,
          operation: 'greater_than'
        }
      ],
      guidanceTemplate: 'stabilize_guidance',
      severity: 'direct',
      interventionLevel: 2
    };
  }

  /**
   * Create CALM strategy configuration
   */
  private createCalmStrategy(): FoldingStrategy {
    return {
      name: 'calm',
      thresholdAdjustments: {
        exploration: 0.02,
        recall: 0.04,
        precision: 0.5,
        prewarming: 0.03,
        resultLimit: 4
      },
      resultModifications: [
        {
          filterType: 'confidence',
          threshold: 0.8,
          operation: 'greater_than'
        }
      ],
      guidanceTemplate: 'calm_guidance',
      severity: 'moderate',
      interventionLevel: 1
    };
  }

  /**
   * Create FOCUS strategy configuration
   */
  private createFocusStrategy(): FoldingStrategy {
    return {
      name: 'focus',
      thresholdAdjustments: {
        exploration: 0.025,
        recall: 0.08,
        precision: 0.35,
        prewarming: 0.04,
        resultLimit: 6
      },
      resultModifications: [
        {
          filterType: 'focus',
          threshold: 0.6,
          operation: 'greater_than'
        }
      ],
      guidanceTemplate: 'focus_guidance',
      severity: 'moderate',
      interventionLevel: 1
    };
  }

  /**
   * Create STANDARD strategy configuration
   */
  private createStandardStrategy(): FoldingStrategy {
    return {
      name: 'standard',
      thresholdAdjustments: {
        exploration: 0.014,
        recall: 0.036,
        precision: 0.300,
        prewarming: 0.05,
        resultLimit: 8
      },
      resultModifications: [],
      guidanceTemplate: 'standard_guidance',
      severity: 'subtle',
      interventionLevel: 0
    };
  }

  /**
   * Calculate intervention level based on violation history and severity
   */
  private calculateInterventionLevel(profile: AgentBehavioralProfile): number {
    let level = 1;

    // Increase based on violation frequency
    if (profile.violationFrequency > 0.7) level += 2;
    else if (profile.violationFrequency > 0.5) level += 1;

    // Increase based on trend
    if (profile.behavioralTrend === 'declining') level += 1;

    // Increase based on severe violations
    const severeViolations = profile.recentViolations.filter(v => v.severity === 'severe').length;
    level += severeViolations;

    return Math.min(level, 5); // Cap at level 5
  }

  /**
   * Get message templates for different strategies
   */
  private getMessageTemplates(): Record<string, string> {
    return {
      stop: 'PROTOCOL_VIOLATION_TEMPLATE',
      stabilize: 'Recent activity patterns suggest instability. Consider focusing on core objectives.',
      calm: 'High cognitive load detected. Take time to process current information before proceeding.',
      focus: 'Search patterns indicate scattered attention. Consider consolidating insights before exploring further.',
      standard: ''
    };
  }

  /**
   * Personalize message based on agent profile and strategy
   */
  private personalizeMessage(baseMessage: string, profile: AgentBehavioralProfile, strategy: FoldingStrategy): string {
    if (strategy.name !== 'stop') {
      return baseMessage;
    }

    // Generate stop-specific messages based on intervention level
    const violationRate = Math.round(profile.violationFrequency * 100);
    
    switch (strategy.interventionLevel) {
      case 1:
        return `BEHAVIORAL GUIDANCE: Recent activity patterns show ${violationRate}% deviation from optimal protocols. Please review current approach.`;
      
      case 2:
        return `PROTOCOL CONCERN: Violation frequency (${violationRate}%) indicates need for behavioral adjustment. Consider pausing to reassess objectives.`;
      
      case 3:
        return `PROTOCOL VIOLATION DETECTED: Current violation frequency (${violationRate}%) exceeds acceptable threshold. Immediate behavioral correction required.`;
      
      case 4:
        return `BEHAVIORAL INTERVENTION REQUIRED: Violation frequency (${violationRate}%) with declining trend. System recommends immediate protocol review and compliance reset.`;
      
      case 5:
        return `ESCALATION NOTICE: Critical violation pattern detected (${violationRate}% frequency). Continued violations may require human oversight and system intervention.`;
      
      default:
        return `PROTOCOL ALERT: Behavioral adjustment needed. Current metrics indicate suboptimal performance patterns.`;
    }
  }
}
```

### `src/behavioral/FoldingStrategyEngine.ts`

```typescript
import { AgentBehavioralProfile, FoldingStrategy, ThresholdConfiguration } from './types';
import { BehavioralAnalysisService } from './BehavioralAnalysisService';

export class FoldingStrategyEngine {
  private analysisService: BehavioralAnalysisService;
  private strategyHistory: Map<string, FoldingStrategy[]> = new Map();

  constructor() {
    this.analysisService = new BehavioralAnalysisService();
  }

  /**
   * Determine the optimal folding strategy for an agent
   */
  async determineFoldingStrategy(profile: AgentBehavioralProfile): Promise<FoldingStrategy> {
    const strategy = this.analysisService.analyzeAgentState(profile);
    
    // Record strategy in history
    this.recordStrategyHistory(profile.agentId, strategy);
    
    // Apply any necessary adjustments based on history
    const adjustedStrategy = this.adjustStrategyBasedOnHistory(profile.agentId, strategy);
    
    return adjustedStrategy;
  }

  /**
   * Apply threshold adjustments based on strategy
   */
  applyThresholdAdjustments(baseThresholds: ThresholdConfiguration, strategy: FoldingStrategy): ThresholdConfiguration {
    return {
      exploration: strategy.thresholdAdjustments.exploration || baseThresholds.exploration,
      recall: strategy.thresholdAdjustments.recall || baseThresholds.recall,
      precision: strategy.thresholdAdjustments.precision || baseThresholds.precision,
      prewarming: strategy.thresholdAdjustments.prewarming || baseThresholds.prewarming,
      resultLimit: strategy.thresholdAdjustments.resultLimit || baseThresholds.resultLimit
    };
  }

  /**
   * Generate strategy-specific guidance message
   */
  generateGuidanceMessage(strategy: FoldingStrategy, profile: AgentBehavioralProfile): string {
    return this.analysisService.generateInterventionMessage(strategy, profile);
  }

  /**
   * Check if strategy requires system alert
   */
  requiresSystemAlert(strategy: FoldingStrategy): boolean {
    return strategy.name === 'stop' && strategy.interventionLevel >= 3;
  }

  /**
   * Check if strategy requires human intervention
   */
  requiresHumanIntervention(strategy: FoldingStrategy): boolean {
    return strategy.name === 'stop' && strategy.interventionLevel >= 4;
  }

  /**
   * Record strategy in history for pattern analysis
   */
  private recordStrategyHistory(agentId: string, strategy: FoldingStrategy): void {
    const history = this.strategyHistory.get(agentId) || [];
    history.push(strategy);
    
    // Keep last 20 strategies
    if (history.length > 20) {
      history.shift();
    }
    
    this.strategyHistory.set(agentId, history);
  }

  /**
   * Adjust strategy based on historical patterns
   */
  private adjustStrategyBasedOnHistory(agentId: string, strategy: FoldingStrategy): FoldingStrategy {
    const history = this.strategyHistory.get(agentId) || [];
    
    if (history.length < 3) {
      return strategy;
    }

    const recentStrategies = history.slice(-5);
    
    // If consistently applying stop strategy, escalate intervention level
    if (strategy.name === 'stop') {
      const stopCount = recentStrategies.filter(s => s.name === 'stop').length;
      
      if (stopCount >= 3) {
        return {
          ...strategy,
          interventionLevel: Math.min(strategy.interventionLevel + 1, 5),
          thresholdAdjustments: {
            ...strategy.thresholdAdjustments,
            resultLimit: Math.max(1, strategy.thresholdAdjustments.resultLimit - 1)
          }
        };
      }
    }

    // If oscillating between strategies, apply stabilization
    const uniqueStrategies = new Set(recentStrategies.map(s => s.name));
    if (uniqueStrategies.size >= 4) {
      return this.createStabilizingStrategy();
    }

    return strategy;
  }

  /**
   * Create a stabilizing strategy for oscillating behaviors
   */
  private createStabilizingStrategy(): FoldingStrategy {
    return {
      name: 'stabilize',
      thresholdAdjustments: {
        exploration: 0.02,
        recall: 0.04,
        precision: 0.4,
        prewarming: 0.03,
        resultLimit: 4
      },
      resultModifications: [
        {
          filterType: 'stability',
          threshold: 0.8,
          operation: 'greater_than'
        }
      ],
      guidanceTemplate: 'oscillation_stabilization',
      severity: 'direct',
      interventionLevel: 2
    };
  }
}
```

### `src/behavioral/ResultModificationPipeline.ts`

```typescript
import { MemorySearchResult, FoldingStrategy, ModifiedSearchResult, ResultFilter, AgentBehavioralProfile } from './types';

export class ResultModificationPipeline {
  /**
   * Apply folding strategy to search results
   */
  async applyStrategy(
    results: MemorySearchResult[], 
    strategy: FoldingStrategy, 
    profile: AgentBehavioralProfile
  ): Promise<ModifiedSearchResult> {
    // 1. Apply result filtering
    let filteredResults = await this.filterResults(results, strategy.resultModifications);
    
    // 2. Apply result limit
    filteredResults = this.limitResults(filteredResults, strategy.thresholdAdjustments.resultLimit);
    
    // 3. Apply strategy-specific modifications
    filteredResults = await this.applyStrategySpecificModifications(filteredResults, strategy);
    
    // 4. Generate guidance message
    const guidance = await this.generateGuidanceMessage(strategy, profile, filteredResults);
    
    // 5. Create modified result
    const modifiedResult: ModifiedSearchResult = {
      originalResults: results,
      filteredResults,
      guidance,
      strategy,
      systemAlert: this.shouldTriggerSystemAlert(strategy),
      interventionRequired: this.shouldTriggerIntervention(strategy),
      metadata: {
        resultsModified: filteredResults.length !== results.length,
        guidanceInjected: guidance.length > 0,
        strategyApplied: strategy.name,
        behavioralContext: profile
      }
    };

    return modifiedResult;
  }

  /**
   * Filter results based on strategy modifications
   */
  async filterResults(results: MemorySearchResult[], filters: ResultFilter[]): Promise<MemorySearchResult[]> {
    let filteredResults = [...results];

    for (const filter of filters) {
      filteredResults = await this.applyFilter(filteredResults, filter);
    }

    return filteredResults;
  }

  /**
   * Inject guidance into results
   */
  async injectGuidance(results: ModifiedSearchResult, guidance: string): Promise<ModifiedSearchResult> {
    return {
      ...results,
      guidance: guidance,
      metadata: {
        ...results.metadata,
        guidanceInjected: true
      }
    };
  }

  /**
   * Apply a single filter to results
   */
  private async applyFilter(results: MemorySearchResult[], filter: ResultFilter): Promise<MemorySearchResult[]> {
    return results.filter(result => {
      const value = this.extractFilterValue(result, filter.filterType);
      
      switch (filter.operation) {
        case 'greater_than':
          return value > filter.threshold;
        case 'less_than':
          return value < filter.threshold;
        case 'equal_to':
          return Math.abs(value - filter.threshold) < 0.001;
        default:
          return true;
      }
    });
  }

  /**
   * Extract filter value from result based on filter type
   */
  private extractFilterValue(result: MemorySearchResult, filterType: string): number {
    switch (filterType) {
      case 'confidence':
        return result.confidence || 0;
      case 'relevance':
        return result.similarity || 0;
      case 'stability':
        // Calculate stability based on result characteristics
        return this.calculateResultStability(result);
      case 'focus':
        // Calculate focus relevance
        return this.calculateResultFocus(result);
      default:
        return 0;
    }
  }

  /**
   * Calculate result stability score
   */
  private calculateResultStability(result: MemorySearchResult): number {
    // Factors that contribute to stability:
    // - High confidence
    // - Evidence quality
    // - Verification method reliability
    
    let stabilityScore = 0;
    
    // Confidence contribution (40%)
    stabilityScore += (result.confidence || 0) * 0.4;
    
    // Evidence quality contribution (30%)
    const evidenceQuality = result.evidence ? 
      Math.min(result.evidence.length / 3, 1.0) : 0;
    stabilityScore += evidenceQuality * 0.3;
    
    // Verification method contribution (30%)
    const verificationScore = this.getVerificationScore(result.verification_method);
    stabilityScore += verificationScore * 0.3;
    
    return Math.min(stabilityScore, 1.0);
  }

  /**
   * Calculate result focus score
   */
  private calculateResultFocus(result: MemorySearchResult): number {
    // Factors that contribute to focus:
    // - Content specificity
    // - Tag relevance
    // - Direct actionability
    
    let focusScore = 0;
    
    // Content specificity (50%)
    const contentLength = result.content?.length || 0;
    const specificityScore = contentLength > 50 && contentLength < 500 ? 1.0 : 0.5;
    focusScore += specificityScore * 0.5;
    
    // Tag relevance (30%)
    const tagScore = result.tags && result.tags.length > 0 ? 
      Math.min(result.tags.length / 5, 1.0) : 0.3;
    focusScore += tagScore * 0.3;
    
    // Direct actionability (20%)
    const actionabilityScore = this.calculateActionability(result);
    focusScore += actionabilityScore * 0.2;
    
    return Math.min(focusScore, 1.0);
  }

  /**
   * Get verification score based on method
   */
  private getVerificationScore(method?: string): number {
    switch (method) {
      case 'manual': return 1.0;
      case 'automated': return 0.8;
      case 'cross_reference': return 0.9;
      case 'inference': return 0.6;
      default: return 0.5;
    }
  }

  /**
   * Calculate actionability of result content
   */
  private calculateActionability(result: MemorySearchResult): number {
    const content = result.content?.toLowerCase() || '';
    
    // Look for action indicators
    const actionWords = ['implement', 'create', 'build', 'test', 'deploy', 'configure', 'setup'];
    const actionCount = actionWords.filter(word => content.includes(word)).length;
    
    return Math.min(actionCount / actionWords.length, 1.0);
  }

  /**
   * Limit results based on strategy
   */
  private limitResults(results: MemorySearchResult[], limit: number): MemorySearchResult[] {
    if (results.length <= limit) {
      return results;
    }
    
    // Sort by confidence and take top results
    return results
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, limit);
  }

  /**
   * Apply strategy-specific modifications
   */
  private async applyStrategySpecificModifications(
    results: MemorySearchResult[], 
    strategy: FoldingStrategy
  ): Promise<MemorySearchResult[]> {
    switch (strategy.name) {
      case 'stop':
        return this.applyStopModifications(results, strategy);
      case 'calm':
        return this.applyCalmModifications(results);
      case 'focus':
        return this.applyFocusModifications(results);
      case 'stabilize':
        return this.applyStabilizeModifications(results);
      default:
        return results;
    }
  }

  /**
   * Apply STOP strategy modifications
   */
  private applyStopModifications(results: MemorySearchResult[], strategy: FoldingStrategy): MemorySearchResult[] {
    // For stop strategy, only return highest confidence, most stable results
    return results
      .filter(r => (r.confidence || 0) >= 0.8)
      .sort((a, b) => {
        const stabilityA = this.calculateResultStability(a);
        const stabilityB = this.calculateResultStability(b);
        return stabilityB - stabilityA;
      })
      .slice(0, Math.min(results.length, strategy.interventionLevel <= 3 ? 2 : 1));
  }

  /**
   * Apply CALM strategy modifications
   */
  private applyCalmModifications(results: MemorySearchResult[]): MemorySearchResult[] {
    // Filter for calming, high-confidence results
    return results
      .filter(r => (r.confidence || 0) >= 0.7)
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  }

  /**
   * Apply FOCUS strategy modifications
   */
  private applyFocusModifications(results: MemorySearchResult[]): MemorySearchResult[] {
    // Prioritize focused, actionable results
    return results.sort((a, b) => {
      const focusA = this.calculateResultFocus(a);
      const focusB = this.calculateResultFocus(b);
      return focusB - focusA;
    });
  }

  /**
   * Apply STABILIZE strategy modifications
   */
  private applyStabilizeModifications(results: MemorySearchResult[]): MemorySearchResult[] {
    // Prioritize stable, well-verified results
    return results.sort((a, b) => {
      const stabilityA = this.calculateResultStability(a);
      const stabilityB = this.calculateResultStability(b);
      return stabilityB - stabilityA;
    });
  }

  /**
   * Generate guidance message based on strategy and results
   */
  private async generateGuidanceMessage(
    strategy: FoldingStrategy, 
    profile: AgentBehavioralProfile, 
    results: MemorySearchResult[]
  ): Promise<string> {
    const templates = this.getGuidanceTemplates();
    let baseMessage = templates[strategy.name] || '';

    if (strategy.name === 'stop') {
      return this.generateStopGuidanceMessage(strategy, profile, results);
    }

    // Add result-specific context
    if (results.length === 0) {
      baseMessage += ' No relevant results found - consider broadening your search criteria.';
    } else if (results.length < 3) {
      baseMessage += ' Limited results available - ensure you have sufficient information before proceeding.';
    }

    return baseMessage;
  }

  /**
   * Generate STOP-specific guidance message
   */
  private generateStopGuidanceMessage(
    strategy: FoldingStrategy, 
    profile: AgentBehavioralProfile, 
    results: MemorySearchResult[]
  ): string {
    const violationRate = Math.round(profile.violationFrequency * 100);
    const baseMessages = [
      `PROTOCOL VIOLATION DETECTED: Recent behavior patterns indicate significant deviations from established guidelines.`,
      `BEHAVIORAL INTERVENTION REQUIRED: Current violation frequency (${violationRate}%) exceeds acceptable threshold.`,
      `SYSTEM RECOMMENDATION: Pause current activity and review protocol documentation.`,
      `ESCALATION NOTICE: Continued violations may require human oversight.`
    ];

    let message = baseMessages[Math.min(strategy.interventionLevel - 1, baseMessages.length - 1)];

    // Add result context
    if (results.length === 0) {
      message += '\n\nNo search results provided due to intervention status. Protocol compliance reset required.';
    } else {
      message += `\n\nMinimal results (${results.length}) provided. Focus on protocol compliance before continuing.`;
    }

    return message;
  }

  /**
   * Get guidance templates for strategies
   */
  private getGuidanceTemplates(): Record<string, string> {
    return {
      calm: 'High cognitive load detected. Take time to process current information before proceeding.',
      focus: 'Search patterns indicate scattered attention. Consider consolidating these insights before exploring further.',
      stabilize: 'Recent activity patterns suggest instability. Focus on core objectives and established protocols.',
      standard: '',
      stop: 'INTERVENTION_REQUIRED'
    };
  }

  /**
   * Check if strategy should trigger system alert
   */
  private shouldTriggerSystemAlert(strategy: FoldingStrategy): boolean {
    return strategy.name === 'stop' && strategy.interventionLevel >= 3;
  }

  /**
   * Check if strategy should trigger intervention
   */
  private shouldTriggerIntervention(strategy: FoldingStrategy): boolean {
    return strategy.name === 'stop' && strategy.interventionLevel >= 4;
  }
}
```

### `src/memory/simplified-registry.ts` (Integration Points)

```typescript
// Add these imports to the existing file
import { AgentPerformanceTracker } from '../behavioral/AgentPerformanceTracker';
import { FoldingStrategyEngine } from '../behavioral/FoldingStrategyEngine';
import { ResultModificationPipeline } from '../behavioral/ResultModificationPipeline';
import { SearchContext } from '../behavioral/types';

// Add these class members to the existing memory handler
class MemoryHandler {
  private agentTracker: AgentPerformanceTracker;
  private strategyEngine: FoldingStrategyEngine;
  private resultPipeline: ResultModificationPipeline;

  constructor() {
    // ... existing constructor code ...
    this.agentTracker = new AgentPerformanceTracker();
    this.strategyEngine = new FoldingStrategyEngine();
    this.resultPipeline = new ResultModificationPipeline();
  }

  /**
   * Enhanced memory search with adaptive folding
   */
  async handleMemorySearchWithFolding(
    query: string,
    searchType: string = 'recall',
    threshold?: number,
    limit?: number,
    agentId?: string,
    sessionId?: string
  ): Promise<ModifiedSearchResult> {
    try {
      // 1. Create search context
      const searchContext: SearchContext = {
        query,
        searchType,
        timestamp: new Date(),
        sessionId: sessionId || 'default',
        previousSearches: [] // Could be populated from session history
      };

      // 2. Track behavioral metrics (if agent ID provided)
      if (agentId) {
        await this.agentTracker.trackBehavioralMetrics(agentId, searchContext);
      }

      // 3. Get agent behavioral profile
      const agentProfile = agentId ? 
        await this.agentTracker.getBehavioralProfile(agentId) :
        this.createDefaultProfile();

      // 4. Determine folding strategy
      const strategy = await this.strategyEngine.determineFoldingStrategy(agentProfile);

      // 5. Apply threshold adjustments based on strategy
      const baseThresholds = this.getBaseThresholds(searchType);
      const adjustedThresholds = this.strategyEngine.applyThresholdAdjustments(baseThresholds, strategy);

      // 6. Execute search with adjusted parameters
      const rawResults = await this.executeSearch(
        query, 
        searchType, 
        adjustedThresholds.precision, 
        adjustedThresholds.resultLimit
      );

      // 7. Apply post-processing folding
      const modifiedResults = await this.resultPipeline.applyStrategy(
        rawResults, 
        strategy, 
        agentProfile
      );

      // 8. Log intervention if required
      if (modifiedResults.systemAlert) {
        await this.logSystemAlert(agentId, strategy, agentProfile);
      }

      if (modifiedResults.interventionRequired) {
        await this.triggerHumanIntervention(agentId, strategy, agentProfile);
      }

      return modifiedResults;

    } catch (error) {
      console.error('Error in adaptive memory search:', error);
      throw error;
    }
  }

  /**
   * Create default profile for anonymous agents
   */
  private createDefaultProfile(): AgentBehavioralProfile {
    return {
      agentId: 'anonymous',
      focusScore: 1.0,
      stabilityScore: 1.0,
      cognitiveLoad: 0.0,
      violationFrequency: 0.0,
      lastViolationTimestamp: new Date(0),
      behavioralTrend: 'stable',
      sessionStartTime: new Date(),
      totalInteractions: 0,
      recentViolations: []
    };
  }

  /**
   * Get base thresholds for search type
   */
  private getBaseThresholds(searchType: string): ThresholdConfiguration {
    const EMPIRICAL_THRESHOLDS = {
      exploration: 0.014,
      recall: 0.036,
      precision: 0.300,
      prewarming: 0.05
    };

    return {
      exploration: EMPIRICAL_THRESHOLDS.exploration,
      recall: EMPIRICAL_THRESHOLDS.recall,
      precision: EMPIRICAL_THRESHOLDS.precision,
      prewarming: EMPIRICAL_THRESHOLDS.prewarming,
      resultLimit: 8
    };
  }

  /**
   * Execute the actual search
   */
  private async executeSearch(
    query: string,
    searchType: string,
    threshold: number,
    limit: number
  ): Promise<MemorySearchResult[]> {
    // Use existing search implementation
    // This would call the existing memory system search functionality
    return await this.existingSearchImplementation(query, searchType, threshold, limit);
  }

  /**
   * Log system alert for monitoring
   */
  private async logSystemAlert(
    agentId: string | undefined,
    strategy: FoldingStrategy,
    profile: AgentBehavioralProfile
  ): Promise<void> {
    const alertData = {
      timestamp: new Date(),
      agentId: agentId || 'anonymous',
      strategy: strategy.name,
      interventionLevel: strategy.interventionLevel,
      violationFrequency: profile.violationFrequency,
      behavioralTrend: profile.behavioralTrend
    };

    // Log to monitoring system
    console.warn('SYSTEM ALERT - Behavioral Intervention:', alertData);
    
    // Could also send to external monitoring service
    // await this.monitoringService.sendAlert(alertData);
  }

  /**
   * Trigger human intervention process
   */
  private async triggerHumanIntervention(
    agentId: string | undefined,
    strategy: FoldingStrategy,
    profile: AgentBehavioralProfile
  ): Promise<void> {
    const interventionData = {
      timestamp: new Date(),
      agentId: agentId || 'anonymous',
      strategy: strategy.name,
      interventionLevel: strategy.interventionLevel,
      profileSnapshot: profile,
      recommendation: 'Human oversight required due to persistent protocol violations'
    };

    // Log critical intervention
    console.error('HUMAN INTERVENTION REQUIRED:', interventionData);
    
    // Could trigger notification to human operators
    // await this.notificationService.sendCriticalAlert(interventionData);
    
    // Could pause agent operations
    // await this.agentManager.pauseAgent(agentId);
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// src/behavioral/__tests__/AgentPerformanceTracker.test.ts
describe('AgentPerformanceTracker', () => {
  test('should track behavioral metrics correctly');
  test('should calculate focus score based on search coherence');
  test('should detect protocol violations');
  test('should update behavioral trends');
});

// src/behavioral/__tests__/BehavioralAnalysisService.test.ts
describe('BehavioralAnalysisService', () => {
  test('should determine correct strategy for each profile type');
  test('should escalate intervention when appropriate');
  test('should generate appropriate intervention messages');
});

// src/behavioral/__tests__/FoldingStrategyEngine.test.ts
describe('FoldingStrategyEngine', () => {
  test('should apply threshold adjustments correctly');
  test('should adjust strategies based on history');
  test('should require alerts for high intervention levels');
});

// src/behavioral/__tests__/ResultModificationPipeline.test.ts
describe('ResultModificationPipeline', () => {
  test('should filter results based on strategy');
  test('should apply strategy-specific modifications');
  test('should generate appropriate guidance messages');
});
```

### Integration Tests

```typescript
// src/behavioral/__tests__/integration.test.ts
describe('Adaptive Memory Folding Integration', () => {
  test('should handle complete folding workflow');
  test('should escalate from subtle to stop strategy');
  test('should maintain performance under load');
  test('should preserve search accuracy while applying interventions');
});
```

## Deployment Strategy

### Phase 1: Development Setup (Week 1)
- [ ] Implement core behavioral types
- [ ] Create AgentPerformanceTracker
- [ ] Basic behavioral metrics calculation
- [ ] Unit tests for tracking

### Phase 2: Strategy Engine (Week 2)
- [ ] Implement BehavioralAnalysisService
- [ ] Create FoldingStrategyEngine
- [ ] Strategy determination logic
- [ ] Message template system

### Phase 3: Result Pipeline (Week 3)
- [ ] Implement ResultModificationPipeline
- [ ] Result filtering and modification
- [ ] Guidance injection system
- [ ] Integration tests

### Phase 4: Integration (Week 4)
- [ ] Integrate with existing memory search
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Monitoring and alerting

### Phase 5: Production Deployment (Week 5)
- [ ] Gradual rollout with feature flags
- [ ] Monitor behavioral intervention effectiveness
- [ ] Tune thresholds based on real usage
- [ ] Documentation and training

## Performance Considerations

### Optimization Targets
- **Latency**: < 50ms additional overhead
- **Memory**: < 10MB additional memory usage
- **CPU**: < 5% additional CPU usage
- **Accuracy**: Maintain 95%+ search relevance

### Monitoring Metrics
- Strategy distribution (% of each strategy applied)
- Intervention effectiveness (violation reduction rates)
- False positive rates for violations
- System performance impact
- User/agent satisfaction scores

This implementation provides a complete, production-ready system for adaptive memory folding with behavioral intervention capabilities, including the enhanced `stop` strategy for direct protocol violation notification.
