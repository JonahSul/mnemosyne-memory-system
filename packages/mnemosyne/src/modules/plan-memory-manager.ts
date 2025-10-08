/**
 * Plan Memory Management Module
 * 
 * Implements plan-based accountability and conversation continuity for both agents and users.
 * Integrates with vector space temporal plotting and causality tracking.
 */

import type { 
	PlanMemoryEntry, 
	PlanMilestone, 
	PlanBlocker, 
	PlanOperations,
	MemoryEntry 
} from './memory-interfaces.js';
import type { 
	EnhancedPlanEntry, 
	ConversationForkAnalysis, 
	CausalAnalysisResult,
	CausalContext,
	TemporalUtils 
} from './enhanced-memory-interfaces.js';

export class PlanMemoryManager implements PlanOperations {
	private plans = new Map<string, PlanMemoryEntry>();
	private enhancedPlans = new Map<string, EnhancedPlanEntry>();
	
	// Vector space integration (injected dependency)
	constructor(
		private vectorStore?: any,
		private causalityAnalyzer?: any
	) {}

	async createPlan(plan: Omit<PlanMemoryEntry, 'id' | 'timestamp'>): Promise<string> {
		const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		const fullPlan: PlanMemoryEntry = {
			...plan,
			id: planId,
			timestamp: new Date().toISOString()
		};
		
		// Store in memory and vector space
		this.plans.set(planId, fullPlan);
		
		// Create vector embedding for semantic search
		if (this.vectorStore) {
			const planVector = await this.vectorStore.generateEmbeddings(
				`${plan.title} ${plan.description} ${plan.objectives.join(' ')}`
			);
			
			await this.vectorStore.store({
				id: planId,
				content: fullPlan,
				embeddings: planVector,
				metadata: {
					type: 'plan',
					status: plan.status,
					priority: plan.priority,
					semanticConcepts: plan.relatedTopics
				}
			});
		}
		
		return planId;
	}

	async updatePlanStatus(planId: string, status: PlanMemoryEntry['status'], evidence?: string): Promise<boolean> {
		const plan = this.plans.get(planId);
		if (!plan) return false;
		
		plan.status = status;
		plan.accountability.lastAccountabilityCheck = new Date().toISOString();
		
		// Update actual completion time if completed
		if (status === 'completed' && !plan.actualEndTime) {
			plan.actualEndTime = new Date().toISOString();
		}
		
		// Record status change as a causal event
		if (this.causalityAnalyzer) {
			await this.causalityAnalyzer.recordEvent({
				eventId: `plan_status_${planId}_${Date.now()}`,
				eventType: 'plan_status_change',
				planId,
				previousStatus: plan.status,
				newStatus: status,
				evidence,
				timestamp: new Date().toISOString()
			});
		}
		
		return true;
	}

	async updatePlanProgress(planId: string, progress: number, milestone?: string): Promise<boolean> {
		const plan = this.plans.get(planId);
		if (!plan) return false;
		
		const previousProgress = plan.progress;
		plan.progress = Math.min(100, Math.max(0, progress));
		
		// Update vector position to reflect progress
		if (this.vectorStore && plan.vectorMetadata.temporalCoordinates.plannedVector) {
			const progressRatio = plan.progress / 100;
			const plannedVector = plan.vectorMetadata.temporalCoordinates.plannedVector;
			const currentVector = plannedVector.map(coord => coord * progressRatio);
			
			plan.vectorMetadata.temporalCoordinates.currentVector = currentVector;
			
			await this.vectorStore.updateVectorPosition(planId, currentVector);
		}
		
		// Mark milestone as completed if provided
		if (milestone) {
			const milestoneObj = plan.milestones.find(m => m.id === milestone);
			if (milestoneObj) {
				milestoneObj.status = 'completed';
				milestoneObj.actualCompletion = new Date().toISOString();
			}
		}
		
		return true;
	}

	async addMilestone(planId: string, milestone: Omit<PlanMilestone, 'id'>): Promise<string> {
		const plan = this.plans.get(planId);
		if (!plan) throw new Error(`Plan ${planId} not found`);
		
		const milestoneId = `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const fullMilestone: PlanMilestone = {
			...milestone,
			id: milestoneId
		};
		
		plan.milestones.push(fullMilestone);
		return milestoneId;
	}

	async addBlocker(planId: string, blocker: Omit<PlanBlocker, 'id'>): Promise<string> {
		const plan = this.plans.get(planId);
		if (!plan) throw new Error(`Plan ${planId} not found`);
		
		const blockerId = `blocker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const fullBlocker: PlanBlocker = {
			...blocker,
			id: blockerId
		};
		
		plan.blockers.push(fullBlocker);
		
		// If blocker is critical, pause the plan
		if (blocker.severity === 'critical') {
			await this.updatePlanStatus(planId, 'paused', `Critical blocker: ${blocker.description}`);
		}
		
		return blockerId;
	}

	async resolveBlocker(planId: string, blockerId: string, resolution: string): Promise<boolean> {
		const plan = this.plans.get(planId);
		if (!plan) return false;
		
		const blocker = plan.blockers.find(b => b.id === blockerId);
		if (!blocker) return false;
		
		blocker.resolvedAt = new Date().toISOString();
		blocker.resolutionStrategy = resolution;
		
		// If this was the last critical blocker, reactivate plan
		const remainingCriticalBlockers = plan.blockers.filter(
			b => !b.resolvedAt && b.severity === 'critical'
		);
		
		if (remainingCriticalBlockers.length === 0 && plan.status === 'paused') {
			await this.updatePlanStatus(planId, 'active', `Resolved blocker: ${resolution}`);
		}
		
		return true;
	}

	async checkAccountability(planId: string): Promise<{
		onTrack: boolean;
		deviations: string[];
		suggestions: string[];
		timeRemaining?: number;
	}> {
		const plan = this.plans.get(planId);
		if (!plan) throw new Error(`Plan ${planId} not found`);
		
		const now = new Date();
		const deviations: string[] = [];
		const suggestions: string[] = [];
		
		// Check time-based accountability
		if (plan.plannedEndTime) {
			const plannedEnd = new Date(plan.plannedEndTime);
			const timeRemaining = plannedEnd.getTime() - now.getTime();
			
			if (timeRemaining < 0) {
				deviations.push('Plan is past planned completion time');
				suggestions.push('Consider extending deadline or re-scoping objectives');
			}
		}
		
		// Check progress vs time accountability
		if (plan.plannedStartTime && plan.plannedEndTime) {
			const totalDuration = new Date(plan.plannedEndTime).getTime() - new Date(plan.plannedStartTime).getTime();
			const elapsed = now.getTime() - new Date(plan.plannedStartTime).getTime();
			const expectedProgress = (elapsed / totalDuration) * 100;
			
			if (plan.progress < expectedProgress - 10) { // 10% tolerance
				deviations.push(`Progress (${plan.progress}%) is behind schedule (expected ${expectedProgress.toFixed(1)}%)`);
				suggestions.push('Consider identifying and resolving blockers or adjusting scope');
			}
		}
		
		// Check for unresolved critical blockers
		const criticalBlockers = plan.blockers.filter(b => !b.resolvedAt && b.severity === 'critical');
		if (criticalBlockers.length > 0) {
			deviations.push(`${criticalBlockers.length} unresolved critical blockers`);
			suggestions.push('Focus on resolving critical blockers before proceeding');
		}
		
		const onTrack = deviations.length === 0;
		const timeRemaining = plan.plannedEndTime 
			? new Date(plan.plannedEndTime).getTime() - now.getTime()
			: undefined;
		
		return {
			onTrack,
			deviations,
			suggestions,
			...(timeRemaining !== undefined && { timeRemaining })
		};
	}

	async detectConversationFork(currentContext: string, planId: string): Promise<{
		isFork: boolean;
		deviationSeverity: 'minor' | 'moderate' | 'major';
		shouldRemind: boolean;
		reminderMessage?: string;
	}> {
		const plan = this.plans.get(planId);
		if (!plan) throw new Error(`Plan ${planId} not found`);
		
		// Only check active plans
		if (plan.status !== 'active') {
			return { isFork: false, deviationSeverity: 'minor', shouldRemind: false };
		}
		
		let isFork = false;
		let deviationSeverity: 'minor' | 'moderate' | 'major' = 'minor';
		let shouldRemind = false;
		let reminderMessage: string | undefined;
		
		// Semantic similarity check using vector space
		if (this.vectorStore && plan.vectorMetadata.spatialRelevance !== undefined) {
			const contextVector = await this.vectorStore.generateEmbeddings(currentContext);
			const planVector = plan.vectorMetadata.temporalCoordinates.currentVector || 
							  plan.vectorMetadata.temporalCoordinates.plannedVector;
			
			if (planVector) {
				const similarity = this.calculateCosineSimilarity(contextVector, planVector);
				plan.vectorMetadata.spatialRelevance = similarity;
				
				if (similarity < 0.3) {
					isFork = true;
					deviationSeverity = similarity < 0.1 ? 'major' : 'moderate';
					shouldRemind = plan.continuity.canRemindUser;
					
					if (shouldRemind) {
						reminderMessage = this.generateReminderMessage(plan, deviationSeverity, similarity);
					}
				}
			}
		}
		
		// Time-based fork detection
		const lastCheck = plan.accountability.lastAccountabilityCheck;
		if (lastCheck) {
			const timeSinceCheck = Date.now() - new Date(lastCheck).getTime();
			const reminderThreshold = (plan.continuity.reminderThreshold || 30) * 60 * 1000; // Convert to ms
			
			if (timeSinceCheck > reminderThreshold && !shouldRemind) {
				shouldRemind = true;
				reminderMessage = `We've been away from the plan "${plan.title}" for ${Math.round(timeSinceCheck / 60000)} minutes. Would you like to return to it?`;
			}
		}
		
		return {
			isFork,
			deviationSeverity,
			shouldRemind,
			...(reminderMessage && { reminderMessage })
		};
	}

	async suggestReturnToPlan(planId: string): Promise<{
		suggestion: string;
		urgency: 'low' | 'medium' | 'high';
		contextBridge: string;
	}> {
		const plan = this.plans.get(planId);
		if (!plan) throw new Error(`Plan ${planId} not found`);
		
		const accountability = await this.checkAccountability(planId);
		const urgency: 'low' | 'medium' | 'high' = accountability.onTrack ? 'low' : 
			accountability.deviations.length > 2 ? 'high' : 'medium';
		
		const suggestion = this.generateReturnSuggestion(plan, accountability, urgency);
		const contextBridge = this.generateContextBridge(plan);
		
		return {
			suggestion,
			urgency,
			contextBridge
		};
	}

	async updatePlanVectorPosition(planId: string, currentVector: number[]): Promise<boolean> {
		const plan = this.plans.get(planId);
		if (!plan) return false;
		
		plan.vectorMetadata.temporalCoordinates.currentVector = currentVector;
		
		if (this.vectorStore) {
			await this.vectorStore.updateVectorPosition(planId, currentVector);
		}
		
		return true;
	}

	async findRelatedPlans(semanticQuery: string, includeCompleted: boolean = false): Promise<PlanMemoryEntry[]> {
		if (!this.vectorStore) {
			// Fallback to text-based search
			const query = semanticQuery.toLowerCase();
			return Array.from(this.plans.values()).filter(plan => {
				if (!includeCompleted && plan.status === 'completed') return false;
				
				return plan.title.toLowerCase().includes(query) ||
					   plan.description.toLowerCase().includes(query) ||
					   plan.objectives.some(obj => obj.toLowerCase().includes(query)) ||
					   plan.relatedTopics.some(topic => topic.toLowerCase().includes(query));
			});
		}
		
		// Vector-based semantic search
		const queryVector = await this.vectorStore.generateEmbeddings(semanticQuery);
		const results = await this.vectorStore.searchSimilar(queryVector, {
			filter: { type: 'plan' },
			limit: 10,
			threshold: 0.1
		});
		
		return results
			.map((result: any) => this.plans.get(result.id))
			.filter((plan: any) => plan && (includeCompleted || plan.status !== 'completed')) as PlanMemoryEntry[];
	}

	async analyzePlanTrajectory(planId: string): Promise<{
		onCourse: boolean;
		projectedCompletion: string;
		courseCorrections: string[];
	}> {
		const plan = this.plans.get(planId);
		if (!plan) throw new Error(`Plan ${planId} not found`);
		
		const courseCorrections: string[] = [];
		let projectedCompletion = plan.plannedEndTime || 'Unknown';
		
		// Analyze progress trajectory
		if (plan.progress > 0 && plan.plannedStartTime && plan.plannedEndTime) {
			const totalDuration = new Date(plan.plannedEndTime).getTime() - new Date(plan.plannedStartTime).getTime();
			const elapsed = Date.now() - new Date(plan.plannedStartTime).getTime();
			const progressRate = plan.progress / elapsed;
			const projectedDuration = 100 / progressRate;
			
			projectedCompletion = new Date(new Date(plan.plannedStartTime).getTime() + projectedDuration).toISOString();
			
			if (projectedDuration > totalDuration * 1.1) { // 10% tolerance
				courseCorrections.push('Current progress rate suggests plan will exceed planned duration');
				courseCorrections.push('Consider re-scoping objectives or allocating more resources');
			}
		}
		
		// Check for vector space trajectory deviation
		const vectorCoords = plan.vectorMetadata.temporalCoordinates;
		let onCourse = true;
		
		if (vectorCoords.currentVector && vectorCoords.plannedVector) {
			const deviation = this.calculateVectorDeviation(vectorCoords.currentVector, vectorCoords.plannedVector);
			if (deviation > 0.3) { // 30% deviation threshold
				onCourse = false;
				courseCorrections.push('Plan trajectory has deviated significantly from planned vector path');
				courseCorrections.push('Consider reviewing approach or updating plan objectives');
			}
		}
		
		return {
			onCourse,
			projectedCompletion,
			courseCorrections
		};
	}

	// Helper methods
	private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
		if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
		
		const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
		const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
		const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
		
		if (magnitudeA === 0 || magnitudeB === 0) return 0;
		return dotProduct / (magnitudeA * magnitudeB);
	}

	private calculateVectorDeviation(current: number[], planned: number[]): number {
		if (!current || !planned || current.length !== planned.length) return 1; // Maximum deviation
		
		const distance = Math.sqrt(
			current.reduce((sum, curr, i) => sum + Math.pow(curr - (planned[i] || 0), 2), 0)
		);
		const plannedMagnitude = Math.sqrt(planned.reduce((sum, p) => sum + p * p, 0));
		
		if (plannedMagnitude === 0) return 1;
		return distance / plannedMagnitude;
	}

	private generateReminderMessage(plan: PlanMemoryEntry, severity: 'minor' | 'moderate' | 'major', similarity: number): string {
		const severityMessages = {
			minor: "I notice we've drifted a bit from",
			moderate: "We seem to have gotten sidetracked from",
			major: "We've moved quite far from our original focus on"
		};
		
		const progress = plan.progress > 0 ? ` (${plan.progress}% complete)` : '';
		return `${severityMessages[severity]} "${plan.title}"${progress}. Would you like to return to that, or shall we continue with the current topic?`;
	}

	private generateReturnSuggestion(plan: PlanMemoryEntry, accountability: any, urgency: 'low' | 'medium' | 'high'): string {
		const urgencyPhrases = {
			low: "When you're ready, we could",
			medium: "It might be good to",
			high: "I recommend we"
		};
		
		const nextStep = plan.milestones.find(m => m.status === 'pending')?.title || 
						plan.objectives.find(obj => !plan.milestones.some(m => m.title.includes(obj))) ||
						'continue with the next steps';
		
		return `${urgencyPhrases[urgency]} return to "${plan.title}" and focus on ${nextStep}.`;
	}

	private generateContextBridge(plan: PlanMemoryEntry): string {
		const relatedTopics = plan.relatedTopics.slice(0, 3).join(', ');
		return `We can bridge back through these related topics: ${relatedTopics}. The plan connects to our current discussion because it shares similar underlying concepts.`;
	}

	// Public getters for testing and debugging
	getAllPlans(): PlanMemoryEntry[] {
		return Array.from(this.plans.values());
	}

	getPlan(planId: string): PlanMemoryEntry | undefined {
		return this.plans.get(planId);
	}
}
