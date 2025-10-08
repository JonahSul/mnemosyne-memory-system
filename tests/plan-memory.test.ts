/**
 * Plan Memory Object Example Usage and Test
 * 
 * Demonstrates how Plan memory objects help with agent and user accountability
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PlanMemoryManager } from '../packages/mnemosyne/src/modules/plan-memory-manager';

class DeterministicVectorStore {
	private vectors = new Map<string, { embeddings: number[]; metadata: Record<string, unknown> }>();

	async generateEmbeddings(input: string): Promise<number[]> {
		const normalized = input.toLowerCase();
		const featureSets = [
			['testing', 'tdd', 'architecture'],
			['security', 'authentication', 'federation'],
			['performance', 'vector', 'vectors', 'optimization'],
			['api', 'documentation', 'docs']
		];

		return featureSets.map(keywords =>
			keywords.some(keyword => normalized.includes(keyword)) ? 1 : 0
		);
	}

	async store(payload: { id: string; embeddings: number[]; metadata: Record<string, unknown> }): Promise<void> {
		this.vectors.set(payload.id, { embeddings: payload.embeddings, metadata: payload.metadata });
	}

	async updateVectorPosition(id: string, updatedVector: number[]): Promise<void> {
		const existing = this.vectors.get(id);
		if (existing) {
			existing.embeddings = updatedVector;
		} else {
			this.vectors.set(id, { embeddings: updatedVector, metadata: { type: 'plan' } });
		}
	}

	async searchSimilar(
		queryVector: number[],
		options: { filter?: Record<string, unknown>; threshold?: number; limit?: number }
	): Promise<Array<{ id: string; similarity: number }>> {
		const threshold = options.threshold ?? 0;
		const candidates: Array<{ id: string; similarity: number }> = [];
		for (const [id, stored] of this.vectors.entries()) {
			if (options.filter?.type && stored.metadata?.type !== options.filter.type) continue;
			const similarity = this.calculateCosineSimilarity(queryVector, stored.embeddings);
			if (similarity >= threshold) {
				candidates.push({ id, similarity });
			}
		}

		return candidates
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, options.limit ?? candidates.length);
	}

	private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
		if (vecA.length !== vecB.length) return 0;
		const dot = vecA.reduce((sum, value, index) => sum + value * vecB[index], 0);
		const magnitudeA = Math.sqrt(vecA.reduce((sum, value) => sum + value * value, 0));
		const magnitudeB = Math.sqrt(vecB.reduce((sum, value) => sum + value * value, 0));
		if (magnitudeA === 0 || magnitudeB === 0) return 0;
		return dot / (magnitudeA * magnitudeB);
	}
}

describe('Plan Memory Object - Accountability and Conversation Continuity', () => {
	let planManager: PlanMemoryManager;

	beforeEach(() => {
		planManager = new PlanMemoryManager(new DeterministicVectorStore());
	});

	describe('User Accountability - Conversation Fork Detection', () => {
		it('should create a plan and detect when user conversation forks away from it', async () => {
			// User starts with a clear plan
			const planId = await planManager.createPlan({
				title: "Implement TDD Test Architecture",
				description: "Design and implement comprehensive TDD architecture to fix 9/72 failing tests",
				objectives: [
					"Design test environment abstraction layer",
					"Create mock bindings provider", 
					"Implement test isolation manager",
					"Set up performance-aware configuration"
				],
				plannedStartTime: new Date().toISOString(),
				plannedEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
				status: 'active',
				priority: 'high',
				progress: 25,
				initiatedBy: 'user',
				userCommitment: 'explicit',
				relatedTopics: ['testing', 'tdd', 'architecture', 'vitest', 'environment'],
				vectorMetadata: {
					semanticCluster: ['testing', 'architecture', 'development'],
					temporalCoordinates: {
						plannedVector: [1, 1, 0, 0], // High testing/architecture focus
						currentVector: [1, 1, 0, 0]
					},
					relatedEvents: [],
					spatialRelevance: 1.0
				},
				milestones: [],
				blockers: [],
				dependencies: [],
				dependents: [],
				accountability: {
					commitmentLevel: 0.9,
					trackingMetrics: ['progress_percentage', 'milestone_completion'],
					checkInFrequency: 'hourly',
					deviationAlerts: true
				},
				continuity: {
					canRemindUser: true,
					reminderThreshold: 30, // 30 minutes
					contextSwitchTolerance: 2,
					originalIntent: "Fix failing tests with proper TDD architecture",
					alternativeApproaches: ['Incremental test fixes', 'Environment-specific solutions']
				}
			});

			expect(planId).toBeDefined();
			const plan = planManager.getPlan(planId);
			expect(plan?.title).toBe("Implement TDD Test Architecture");
			expect(plan?.status).toBe('active');

			// Simulate user conversation forking to a different topic
			const currentContext = "I'm interested in learning about Docker containerization for microservices deployment strategies";
			
			const forkAnalysis = await planManager.detectConversationFork(currentContext, planId);
			
			// Should detect this as a fork since Docker/containers is semantically distant from TDD testing
			expect(forkAnalysis.isFork).toBe(true);
			expect(forkAnalysis.deviationSeverity).toBe('major'); // Very different topic
			expect(forkAnalysis.shouldRemind).toBe(true);
			expect(forkAnalysis.reminderMessage).toContain('TDD Test Architecture');
		});

		it('should suggest returning to plan with context bridging', async () => {
			const planId = await planManager.createPlan({
				title: "Security Architecture Review",
				description: "Review and improve federation authentication security",
				objectives: ["Audit CORS policies", "Implement Bearer token validation", "Add rate limiting"],
				plannedStartTime: new Date().toISOString(),
				status: 'active',
				priority: 'critical',
				progress: 40,
				initiatedBy: 'collaborative',
				relatedTopics: ['security', 'authentication', 'federation'],
				vectorMetadata: {
					semanticCluster: ['security', 'authentication'],
					temporalCoordinates: {
						plannedVector: [0, 1, 0, 0],
						currentVector: [0, 1, 0, 0]
					},
					relatedEvents: [],
					spatialRelevance: 1.0
				},
				milestones: [],
				blockers: [],
				dependencies: [],
				dependents: [],
				accountability: {
					commitmentLevel: 0.95,
					trackingMetrics: ['security_audit_completion'],
					deviationAlerts: true
				},
				continuity: {
					canRemindUser: true,
					reminderThreshold: 20,
					contextSwitchTolerance: 1,
					originalIntent: "Secure the federation authentication system"
				}
			});

			const suggestion = await planManager.suggestReturnToPlan(planId);
			
			expect(suggestion.suggestion).toContain('Security Architecture Review');
			expect(suggestion.urgency).toBe('low');
			expect(suggestion.contextBridge).toContain('security');
		});
	});

	describe('Agent Accountability - Progress and Milestone Tracking', () => {
		it('should track agent accountability through milestones and blockers', async () => {
			const planId = await planManager.createPlan({
				title: "Memory System Performance Optimization",
				description: "Optimize vector search performance for Foundation v1.8.0",
				objectives: [
					"Profile current vector operations",
					"Implement caching layer",
					"Optimize embedding generation",
					"Add performance monitoring"
				],
				plannedStartTime: new Date().toISOString(),
				plannedEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
				status: 'active',
				priority: 'medium',
				progress: 10,
				initiatedBy: 'agent',
				agentResponsible: 'development_generalist',
				relatedTopics: ['performance', 'optimization', 'vectors'],
				vectorMetadata: {
					semanticCluster: ['performance', 'optimization'],
					temporalCoordinates: {
						plannedVector: [0, 0, 1, 0],
					},
					relatedEvents: [],
					spatialRelevance: 1.0
				},
				milestones: [],
				blockers: [],
				dependencies: [],
				dependents: [],
				accountability: {
					commitmentLevel: 0.8,
					trackingMetrics: ['performance_benchmarks', 'milestone_completion'],
					checkInFrequency: 'daily',
					deviationAlerts: true
				},
				continuity: {
					canRemindUser: false, // Agent-initiated, don't remind user
					reminderThreshold: 60,
					contextSwitchTolerance: 3,
					originalIntent: "Improve system performance through vector optimization"
				}
			});

			// Add milestone
			const milestoneId = await planManager.addMilestone(planId, {
				title: "Complete vector operation profiling",
				description: "Profile all vector operations to identify bottlenecks",
				plannedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
				status: 'pending',
				dependencies: []
			});

			expect(milestoneId).toBeDefined();

			// Add a blocker
			const blockerId = await planManager.addBlocker(planId, {
				description: "Need access to production vector database for profiling",
				severity: 'critical',
				type: 'resource',
				discoveredAt: new Date().toISOString(),
				impact: "Cannot profile real performance without production data"
			});

			expect(blockerId).toBeDefined();

			// Check accountability - should show blocker impact
			const accountability = await planManager.checkAccountability(planId);
			expect(accountability.onTrack).toBe(false); // Due to critical blocker
			expect(accountability.deviations).toContain('1 unresolved critical blockers');
			expect(accountability.suggestions.some((suggestion: string) =>
				suggestion.includes('Focus on resolving critical blockers')
			)).toBe(true);

			// Resolve the blocker
			await planManager.resolveBlocker(planId, blockerId, "Obtained read-only access to production analytics");
			
			// Update progress after resolving blocker
			await planManager.updatePlanProgress(planId, 30, milestoneId);

			// Re-check accountability
			const updatedAccountability = await planManager.checkAccountability(planId);
			expect(updatedAccountability.onTrack).toBe(true); // No more blockers
			
			const plan = planManager.getPlan(planId);
			expect(plan?.progress).toBe(30);
			expect(plan?.milestones[0].status).toBe('completed');
		});

		it('should analyze plan trajectory and suggest course corrections', async () => {
			const planId = await planManager.createPlan({
				title: "Federation Agent Implementation",
				description: "Implement ARBITER and ARCHIVIST federation agents",
				objectives: ["Design agent interfaces", "Implement ARBITER logic", "Implement ARCHIVIST bulk operations"],
				plannedStartTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Started 4 hours ago
				plannedEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Should end in 2 hours
				status: 'active',
				priority: 'high',
				progress: 20, // Only 20% progress in 4 hours (should be ~67%)
				initiatedBy: 'collaborative',
				relatedTopics: ['federation', 'agents', 'implementation'],
				vectorMetadata: {
					semanticCluster: ['federation', 'implementation'],
					temporalCoordinates: {
						plannedVector: [0, 1, 1, 0],
						currentVector: [0, 0, 1, 0] // Deviating from plan
					},
					relatedEvents: [],
					spatialRelevance: 0.7
				},
				milestones: [],
				blockers: [],
				dependencies: [],
				dependents: [],
				accountability: {
					commitmentLevel: 0.85,
					trackingMetrics: ['implementation_progress'],
					deviationAlerts: true
				},
				continuity: {
					canRemindUser: true,
					reminderThreshold: 45,
					contextSwitchTolerance: 2,
					originalIntent: "Complete federation agent implementation"
				}
			});

			const trajectory = await planManager.analyzePlanTrajectory(planId);
			
			expect(trajectory.onCourse).toBe(false); // Behind schedule and vector deviation
			expect(trajectory.courseCorrections.length).toBeGreaterThan(0);
			expect(trajectory.courseCorrections.some((correction: string) => 
				correction.includes('exceed planned duration')
			)).toBe(true);
		});
	});

	describe('Temporal Vector Space Plotting', () => {
		it('should track plan progress through vector space coordinates', async () => {
			const planId = await planManager.createPlan({
				title: "API Documentation Generation",
				description: "Generate comprehensive API documentation using vector embeddings",
				objectives: ["Extract API endpoints", "Generate embeddings", "Create searchable docs"],
				plannedStartTime: new Date().toISOString(),
				status: 'active',
				priority: 'medium',
				progress: 0,
				initiatedBy: 'user',
				relatedTopics: ['documentation', 'api', 'vectors'],
				vectorMetadata: {
					semanticCluster: ['documentation', 'api'],
					temporalCoordinates: {
						plannedVector: [0, 0, 1, 1], // Planned endpoint
					},
					relatedEvents: [],
					spatialRelevance: 1.0
				},
				milestones: [],
				blockers: [],
				dependencies: [],
				dependents: [],
				accountability: {
					commitmentLevel: 0.7,
					trackingMetrics: ['documentation_coverage'],
					deviationAlerts: true
				},
				continuity: {
					canRemindUser: true,
					reminderThreshold: 30,
					contextSwitchTolerance: 2,
					originalIntent: "Create comprehensive API documentation"
				}
			});

			// Simulate progress by updating vector position
			const progressVector = [0.1, 0.1, 0.3, 0.3]; // Manual update to track progress
			await planManager.updatePlanVectorPosition(planId, progressVector);

			let plan = planManager.getPlan(planId);
			expect(plan).toBeDefined();
			expect(plan?.vectorMetadata.temporalCoordinates.currentVector).toEqual(progressVector);

			await planManager.updatePlanProgress(planId, 50);
			plan = planManager.getPlan(planId);
			expect(plan).toBeDefined();
			const plannedVector = plan?.vectorMetadata.temporalCoordinates.plannedVector;
			expect(plannedVector).toBeDefined();
			const expectedAutoVector = plannedVector!.map(coord => coord * 0.5);
			expect(plan?.vectorMetadata.temporalCoordinates.currentVector).toEqual(expectedAutoVector);
			expect(plan?.progress).toBe(50);

			// Find related plans through vector similarity
			const relatedPlans = await planManager.findRelatedPlans("API development documentation");
			expect(relatedPlans.length).toBeGreaterThan(0);
			expect(relatedPlans[0].id).toBe(planId);
		});
	});
});
