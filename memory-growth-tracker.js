#!/usr/bin/env node

/**
 * Memory Growth Tracking System
 * Automated monitoring and data collection for Mnemosyne memory growth analysis
 * 
 * This script collects memory statistics over time and analyzes growth patterns
 * to understand how Athena's knowledge building affects memory utilization.
 */

const { writeFileSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');

class MemoryGrowthTracker {
  constructor() {
    this.dataDir = './.mnemosyne/growth-tracking';
    this.snapshotsFile = join(this.dataDir, 'memory-snapshots.json');
    this.analysisFile = join(this.dataDir, 'growth-analysis.json');
    this.ensureDataDirectory();
  }

  private ensureDataDirectory() {
    const fs = require('fs');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Collect current memory statistics and create snapshot
   */
  async collectSnapshot(): Promise<MemorySnapshot> {
    console.log('📊 Collecting memory statistics...');
    
    // Simulate MCP call to get current stats
    // In real implementation, this would call the actual MCP memory tools
    const mockCurrentStats = {
      total_items: 3,
      short_term: 3,
      intermediate_term: 0,
      long_term: 0,
      active_rules: 3,
      total_claims: 0,
      verified_claims: 0
    };

    const timestamp = new Date().toISOString();
    const previousSnapshots = this.loadSnapshots();
    
    // Calculate growth rates
    const metrics = {
      ...mockCurrentStats,
      capacity_utilization: (mockCurrentStats.total_items / 1250) * 100,
      growth_rate_1h: this.calculateGrowthRate(previousSnapshots, 1),
      growth_rate_24h: this.calculateGrowthRate(previousSnapshots, 24),
      growth_rate_7d: this.calculateGrowthRate(previousSnapshots, 168),
      tier_distribution: this.calculateTierDistribution(mockCurrentStats),
      athena_activity_level: this.detectAthenaActivity(previousSnapshots) as any
    };

    const derived = {
      items_since_last_hour: this.getItemsSincePeriod(previousSnapshots, 1),
      items_since_yesterday: this.getItemsSincePeriod(previousSnapshots, 24),
      tier_promotion_rate: this.calculateTierPromotionRate(previousSnapshots),
      knowledge_density: this.calculateKnowledgeDensity(metrics),
      system_health_score: this.calculateHealthScore(metrics)
    };

    const snapshot: MemorySnapshot = {
      timestamp,
      metrics,
      derived
    };

    this.saveSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Analyze growth patterns and generate insights
   */
  analyzeGrowthPatterns(): GrowthAnalysis {
    console.log('📈 Analyzing growth patterns...');
    
    const snapshots = this.loadSnapshots();
    if (snapshots.length < 2) {
      console.log('⚠️ Insufficient data for analysis (need at least 2 snapshots)');
      return this.createBaselineAnalysis();
    }

    const period = this.getAnalysisPeriod(snapshots);
    const totalGrowth = this.calculateTotalGrowth(snapshots);
    const averageDailyGrowth = this.calculateAverageDailyGrowth(snapshots);
    const peakGrowthDay = this.findPeakGrowthDay(snapshots);
    
    const tierMigrationPatterns = this.analyzeTierMigrations(snapshots);
    const predictions = this.generatePredictions(snapshots);

    const analysis: GrowthAnalysis = {
      period,
      total_growth: totalGrowth,
      average_daily_growth: averageDailyGrowth,
      peak_growth_day: peakGrowthDay,
      tier_migration_patterns: tierMigrationPatterns,
      predictions
    };

    this.saveAnalysis(analysis);
    return analysis;
  }

  /**
   * Generate comprehensive growth report
   */
  generateReport(): string {
    console.log('📋 Generating growth report...');
    
    const latestSnapshot = this.getLatestSnapshot();
    const analysis = this.analyzeGrowthPatterns();
    
    if (!latestSnapshot) {
      return this.generateBaselineReport();
    }

    const report = `# Memory Growth Report
**Generated**: ${new Date().toISOString()}
**Analysis Period**: ${analysis.period}

## Current Status
- **Total Items**: ${latestSnapshot.metrics.total_items}
- **Capacity Utilization**: ${latestSnapshot.metrics.capacity_utilization.toFixed(2)}%
- **Growth Rate (24h)**: ${latestSnapshot.metrics.growth_rate_24h} items/day
- **System Health**: ${latestSnapshot.derived.system_health_score.toFixed(1)}/10
- **Athena Activity**: ${latestSnapshot.metrics.athena_activity_level}

## Growth Trends
- **Total Growth**: +${analysis.total_growth} items over ${analysis.period}
- **Average Daily Growth**: ${analysis.average_daily_growth.toFixed(1)} items/day
- **Peak Growth Day**: ${analysis.peak_growth_day}
- **Trend Direction**: ${analysis.predictions.growth_trend}

## Tier Distribution
- **Short-term**: ${latestSnapshot.metrics.short_term} items (${latestSnapshot.metrics.tier_distribution[0].toFixed(1)}%)
- **Intermediate**: ${latestSnapshot.metrics.intermediate_term} items (${latestSnapshot.metrics.tier_distribution[1].toFixed(1)}%)
- **Long-term**: ${latestSnapshot.metrics.long_term} items (${latestSnapshot.metrics.tier_distribution[2].toFixed(1)}%)

## Predictions
- **Next Week Projection**: ${analysis.predictions.next_week_projection} total items
- **Capacity Exhaustion**: ${analysis.predictions.capacity_exhaustion_date || 'Not projected'}

## Recommendations
${this.generateRecommendations(latestSnapshot, analysis)}
`;

    const reportPath = `./.mnemosyne/memory-growth-report-${new Date().toISOString().split('T')[0]}.md`;
    writeFileSync(reportPath, report);
    console.log(`✅ Report saved to: ${reportPath}`);
    
    return report;
  }

  // Helper methods
  private loadSnapshots(): MemorySnapshot[] {
    if (!existsSync(this.snapshotsFile)) {
      return [];
    }
    try {
      const data = readFileSync(this.snapshotsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to load snapshots:', error);
      return [];
    }
  }

  private saveSnapshot(snapshot: MemorySnapshot) {
    const snapshots = this.loadSnapshots();
    snapshots.push(snapshot);
    
    // Keep only last 1000 snapshots to prevent unbounded growth
    if (snapshots.length > 1000) {
      snapshots.splice(0, snapshots.length - 1000);
    }
    
    writeFileSync(this.snapshotsFile, JSON.stringify(snapshots, null, 2));
    console.log(`✅ Snapshot saved (${snapshots.length} total snapshots)`);
  }

  private calculateGrowthRate(snapshots: MemorySnapshot[], hoursBack: number): number {
    if (snapshots.length < 2) return 0;
    
    const now = new Date();
    const targetTime = new Date(now.getTime() - (hoursBack * 60 * 60 * 1000));
    
    const recentSnapshot = snapshots[snapshots.length - 1];
    const olderSnapshot = snapshots.find(s => new Date(s.timestamp) <= targetTime);
    
    if (!olderSnapshot) return 0;
    
    const itemDiff = recentSnapshot.metrics.total_items - olderSnapshot.metrics.total_items;
    const timeDiff = (new Date(recentSnapshot.timestamp).getTime() - new Date(olderSnapshot.timestamp).getTime()) / (1000 * 60 * 60);
    
    return timeDiff > 0 ? (itemDiff / timeDiff) * 24 : 0; // Convert to items per day
  }

  private calculateTierDistribution(stats: any): [number, number, number] {
    const total = stats.total_items;
    if (total === 0) return [0, 0, 0];
    
    return [
      (stats.short_term / total) * 100,
      (stats.intermediate_term / total) * 100,
      (stats.long_term / total) * 100
    ];
  }

  private detectAthenaActivity(snapshots: MemorySnapshot[]): string {
    if (snapshots.length < 3) return 'baseline';
    
    const recentGrowth = snapshots.slice(-3).map(s => s.metrics.growth_rate_24h);
    const avgGrowth = recentGrowth.reduce((a, b) => a + b, 0) / recentGrowth.length;
    
    if (avgGrowth > 100) return 'intensive';
    if (avgGrowth > 50) return 'high';
    if (avgGrowth > 10) return 'moderate';
    return 'baseline';
  }

  private getItemsSincePeriod(snapshots: MemorySnapshot[], hours: number): number {
    if (snapshots.length < 2) return 0;
    
    const now = new Date();
    const targetTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    const recentSnapshot = snapshots[snapshots.length - 1];
    const olderSnapshot = snapshots.find(s => new Date(s.timestamp) <= targetTime);
    
    if (!olderSnapshot) return 0;
    
    return recentSnapshot.metrics.total_items - olderSnapshot.metrics.total_items;
  }

  private calculateTierPromotionRate(snapshots: MemorySnapshot[]): number {
    // Calculate the rate at which items move between tiers
    if (snapshots.length < 10) return 0;
    
    const recent = snapshots.slice(-10);
    let promotions = 0;
    
    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1];
      const curr = recent[i];
      
      // Count items that moved from short to intermediate or intermediate to long
      const shortDecrease = Math.max(0, prev.metrics.short_term - curr.metrics.short_term);
      const longIncrease = Math.max(0, curr.metrics.long_term - prev.metrics.long_term);
      
      promotions += shortDecrease + longIncrease;
    }
    
    return promotions / recent.length;
  }

  private calculateKnowledgeDensity(metrics: any): number {
    // Measure of knowledge concentration - higher is better
    const totalItems = metrics.total_items;
    if (totalItems === 0) return 0;
    
    // Weight long-term items more heavily
    const weightedItems = (metrics.short_term * 1) + (metrics.intermediate_term * 2) + (metrics.long_term * 3);
    return weightedItems / totalItems;
  }

  private calculateHealthScore(metrics: any): number {
    // Overall system health score 0-10
    let score = 10;
    
    // Deduct for high capacity utilization
    if (metrics.capacity_utilization > 90) score -= 3;
    else if (metrics.capacity_utilization > 80) score -= 1;
    
    // Deduct for unverified claims
    const claimRatio = metrics.total_claims > 0 ? metrics.verified_claims / metrics.total_claims : 1;
    score -= (1 - claimRatio) * 2;
    
    // Bonus for good tier distribution
    if (metrics.long_term > metrics.short_term * 0.1) score += 0.5;
    
    return Math.max(0, Math.min(10, score));
  }

  private createBaselineAnalysis(): GrowthAnalysis {
    return {
      period: 'baseline',
      total_growth: 0,
      average_daily_growth: 0,
      peak_growth_day: 'none',
      tier_migration_patterns: {
        short_to_intermediate: 0,
        intermediate_to_long: 0
      },
      predictions: {
        capacity_exhaustion_date: null,
        next_week_projection: 3,
        growth_trend: 'steady'
      }
    };
  }

  private getAnalysisPeriod(snapshots: MemorySnapshot[]): string {
    if (snapshots.length < 2) return 'insufficient data';
    
    const first = new Date(snapshots[0].timestamp);
    const last = new Date(snapshots[snapshots.length - 1].timestamp);
    const days = Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
    
    return `${days} days`;
  }

  private calculateTotalGrowth(snapshots: MemorySnapshot[]): number {
    if (snapshots.length < 2) return 0;
    return snapshots[snapshots.length - 1].metrics.total_items - snapshots[0].metrics.total_items;
  }

  private calculateAverageDailyGrowth(snapshots: MemorySnapshot[]): number {
    if (snapshots.length < 2) return 0;
    
    const totalGrowth = this.calculateTotalGrowth(snapshots);
    const first = new Date(snapshots[0].timestamp);
    const last = new Date(snapshots[snapshots.length - 1].timestamp);
    const days = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);
    
    return days > 0 ? totalGrowth / days : 0;
  }

  private findPeakGrowthDay(snapshots: MemorySnapshot[]): string {
    if (snapshots.length < 2) return 'none';
    
    let maxGrowth = 0;
    let peakDay = 'none';
    
    for (let i = 1; i < snapshots.length; i++) {
      const growth = snapshots[i].metrics.total_items - snapshots[i - 1].metrics.total_items;
      if (growth > maxGrowth) {
        maxGrowth = growth;
        peakDay = snapshots[i].timestamp.split('T')[0];
      }
    }
    
    return peakDay;
  }

  private analyzeTierMigrations(snapshots: MemorySnapshot[]): any {
    // Analyze how items flow between tiers
    if (snapshots.length < 10) {
      return {
        short_to_intermediate: 0,
        intermediate_to_long: 0
      };
    }
    
    let shortToIntermediate = 0;
    let intermediateToLong = 0;
    
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      
      // Simplified migration detection
      if (curr.metrics.intermediate_term > prev.metrics.intermediate_term) {
        shortToIntermediate++;
      }
      if (curr.metrics.long_term > prev.metrics.long_term) {
        intermediateToLong++;
      }
    }
    
    return {
      short_to_intermediate: shortToIntermediate,
      intermediate_to_long: intermediateToLong
    };
  }

  private generatePredictions(snapshots: MemorySnapshot[]): any {
    const avgGrowth = this.calculateAverageDailyGrowth(snapshots);
    const currentItems = snapshots[snapshots.length - 1].metrics.total_items;
    
    // Predict capacity exhaustion
    const capacityExhaustionDate = avgGrowth > 0 
      ? new Date(Date.now() + ((1250 - currentItems) / avgGrowth) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;
    
    // Next week projection
    const nextWeekProjection = Math.round(currentItems + (avgGrowth * 7));
    
    // Growth trend analysis
    const recentGrowthRates = snapshots.slice(-7).map(s => s.metrics.growth_rate_24h);
    const growthTrend = this.analyzeGrowthTrend(recentGrowthRates);
    
    return {
      capacity_exhaustion_date: capacityExhaustionDate,
      next_week_projection: nextWeekProjection,
      growth_trend: growthTrend
    };
  }

  private analyzeGrowthTrend(growthRates: number[]): string {
    if (growthRates.length < 3) return 'steady';
    
    const slope = this.calculateSlope(growthRates);
    const variance = this.calculateVariance(growthRates);
    
    if (variance > 50) return 'volatile';
    if (slope > 5) return 'accelerating';
    if (slope < -5) return 'decelerating';
    return 'steady';
  }

  private calculateSlope(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private getLatestSnapshot(): MemorySnapshot | null {
    const snapshots = this.loadSnapshots();
    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  }

  private saveAnalysis(analysis: GrowthAnalysis) {
    writeFileSync(this.analysisFile, JSON.stringify(analysis, null, 2));
  }

  private generateBaselineReport(): string {
    return `# Memory Growth Report (Baseline)
**Generated**: ${new Date().toISOString()}

## Status
System is at baseline - starting memory growth tracking.
Run monitoring to collect data for analysis.
`;
  }

  private generateRecommendations(snapshot: MemorySnapshot, analysis: GrowthAnalysis): string {
    const recommendations: string[] = [];
    
    if (snapshot.metrics.capacity_utilization > 80) {
      recommendations.push('⚠️ Consider implementing memory optimization - capacity above 80%');
    }
    
    if (analysis.predictions.growth_trend === 'accelerating') {
      recommendations.push('📈 Growth is accelerating - monitor capacity closely');
    }
    
    if (snapshot.metrics.tier_distribution[2] < 10 && snapshot.metrics.total_items > 100) {
      recommendations.push('🔄 Consider promoting more items to long-term memory');
    }
    
    if (snapshot.derived.system_health_score < 7) {
      recommendations.push('🏥 System health below optimal - review claim verification');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ System operating optimally - continue monitoring');
    }
    
    return recommendations.join('\n');
  }
}

// CLI Interface
if (require.main === module) {
  const tracker = new MemoryGrowthTracker();
  const command = process.argv[2];
  
  switch (command) {
    case 'snapshot':
      tracker.collectSnapshot().then(snapshot => {
        console.log('📊 Snapshot collected:', snapshot.timestamp);
        console.log(`Items: ${snapshot.metrics.total_items}, Utilization: ${snapshot.metrics.capacity_utilization.toFixed(2)}%`);
      });
      break;
      
    case 'analyze':
      const analysis = tracker.analyzeGrowthPatterns();
      console.log('📈 Analysis complete');
      console.log(`Total growth: ${analysis.total_growth}, Trend: ${analysis.predictions.growth_trend}`);
      break;
      
    case 'report':
      const report = tracker.generateReport();
      console.log('📋 Report generated');
      console.log(report);
      break;
      
    case 'monitor':
      console.log('🔄 Starting continuous monitoring...');
      setInterval(async () => {
        await tracker.collectSnapshot();
        if (Math.random() > 0.9) { // Generate analysis 10% of the time
          tracker.analyzeGrowthPatterns();
        }
      }, 60 * 60 * 1000); // Every hour
      break;
      
    default:
      console.log(`Memory Growth Tracker
      
Usage:
  node memory-growth-tracker.js snapshot  - Collect current memory snapshot
  node memory-growth-tracker.js analyze   - Analyze growth patterns  
  node memory-growth-tracker.js report    - Generate comprehensive report
  node memory-growth-tracker.js monitor   - Start continuous monitoring
`);
  }
}

export { MemoryGrowthTracker, type MemorySnapshot, type GrowthAnalysis };
