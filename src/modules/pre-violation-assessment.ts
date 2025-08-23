/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Pre-Violation Assessment Module
 * 
 * Implements proactive violation prevention through memory-mediated self-assessment
 * before taking actions. This module provides the core assessment capabilities
 * for terminal commands, file operations, and user interactions.
 */

import type { MnemosyneMemorySystem } from '../memory-tool.js';

export interface ViolationRisk {
	level: 'PROCEED' | 'CAUTION' | 'STOP' | 'ASK';
	confidence: number; // 0-1
	reasoning: string;
	recommendations?: string[];
	evidence?: ViolationEvidence[];
}

export interface ViolationEvidence {
	type: 'violation_history' | 'pattern_match' | 'user_feedback';
	description: string;
	timestamp: string;
	relevance: number; // 0-1
}

export interface ProjectContext {
	type: 'typescript' | 'node' | 'python' | 'unknown';
	hasPackageJson: boolean;
	hasTsConfig: boolean;
	buildTools: string[];
}

/**
 * Pre-Violation Assessment Engine
 * 
 * Core assessment engine that analyzes potential violations before actions
 * are taken, using memory search and pattern recognition.
 */
export class PreViolationAssessment {
	private memory: MnemosyneMemorySystem;
	private projectContext: ProjectContext | null = null;

	constructor(memory: MnemosyneMemorySystem) {
		this.memory = memory;
	}

	/**
	 * Assess terminal command for violation risk
	 */
	async assessTerminalCommand(command: string, context?: Record<string, unknown>): Promise<ViolationRisk> {
		// Initialize project context if not available
		if (!this.projectContext) {
			this.projectContext = await this.detectProjectContext();
		}

		const evidence: ViolationEvidence[] = [];
		let riskLevel: ViolationRisk['level'] = 'PROCEED';
		let confidence = 0.5;
		let reasoning = 'No specific risk patterns detected';

		// 1. Check for known violation patterns
		const violationPatterns = await this.searchViolationPatterns(command);
		if (violationPatterns.length > 0) {
			evidence.push(...violationPatterns);
			
			// High-risk patterns
			if (this.isHighRiskPattern(command, this.projectContext)) {
				riskLevel = 'STOP';
				confidence = 0.9;
				reasoning = 'Known high-risk pattern detected in memory';
			} else {
				riskLevel = 'CAUTION';
				confidence = 0.7;
				reasoning = 'Potential risk pattern identified';
			}
		}

		// 2. Project-specific assessments
		const projectRisk = this.assessProjectSpecificRisk(command, this.projectContext);
		if (projectRisk.level !== 'PROCEED') {
			evidence.push(...projectRisk.evidence);
			if (projectRisk.level === 'STOP') {
				riskLevel = 'STOP';
				confidence = Math.max(confidence, projectRisk.confidence || 0.5);
				reasoning = projectRisk.reasoning || 'Project-specific risk detected';
			}
		}

		// 3. User feedback patterns
		const feedbackRisk = await this.assessUserFeedbackPatterns(command);
		if (feedbackRisk.evidence.length > 0) {
			evidence.push(...feedbackRisk.evidence);
			if (feedbackRisk.level === 'STOP' && riskLevel !== 'STOP') {
				riskLevel = 'CAUTION';
				confidence = Math.max(confidence, 0.6);
			}
		}

		return {
			level: riskLevel,
			confidence,
			reasoning,
			recommendations: this.generateRecommendations(command, riskLevel, this.projectContext),
			evidence
		};
	}

	/**
	 * Search memory for violation patterns related to command
	 */
	private async searchViolationPatterns(command: string): Promise<ViolationEvidence[]> {
		const evidence: ViolationEvidence[] = [];

		try {
			// Search for direct command violations
			const directMatches = await this.memory.searchTiered(
				`terminal command ${command} violation`,
				{ threshold: 0.036, limit: 5 }
			);

			if (directMatches && directMatches.results) {
				for (const match of directMatches.results) {
					evidence.push({
						type: 'violation_history',
						description: `Previous violation: ${match.content}`,
						timestamp: match.timestamp || new Date().toISOString(),
						relevance: match.similarity || 0.5
					});
				}
			}

			// Search for pattern violations
			const commandTokens = command.split(' ');
			for (const token of commandTokens) {
				if (token.length > 3) { // Avoid noise from short tokens
					const patternMatches = await this.memory.searchTiered(
						`${token} violation pattern`,
						{ threshold: 0.036, limit: 3 }
					);

					if (patternMatches && patternMatches.results) {
						for (const match of patternMatches.results) {
							evidence.push({
								type: 'pattern_match',
								description: `Pattern match: ${match.content}`,
								timestamp: match.timestamp || new Date().toISOString(),
								relevance: (match.similarity || 0.5) * 0.8 // Slightly lower weight for pattern matches
							});
						}
					}
				}
			}
		} catch (error) {
			console.warn('Error searching violation patterns:', error);
		}

		return evidence;
	}

	/**
	 * Check for high-risk patterns based on command and project context
	 */
	private isHighRiskPattern(command: string, projectContext: ProjectContext): boolean {
		// TypeScript project + npm build = high risk
		if (projectContext.type === 'typescript' && command.includes('npm') && command.includes('build')) {
			return true;
		}

		// Other known high-risk patterns
		const highRiskPatterns = [
			/npm\s+build.*typescript/i,
			/npm\s+run\s+build.*\.ts/i,
			/tsc.*build/i
		];

		return highRiskPatterns.some(pattern => pattern.test(command));
	}

	/**
	 * Assess project-specific risks
	 */
	private assessProjectSpecificRisk(command: string, projectContext: ProjectContext): Partial<ViolationRisk> & { evidence: ViolationEvidence[] } {
		const evidence: ViolationEvidence[] = [];

		// TypeScript project specific risks
		if (projectContext.type === 'typescript') {
			if (command.includes('npm') && command.includes('build')) {
				evidence.push({
					type: 'pattern_match',
					description: 'npm build command in TypeScript project - known violation pattern',
					timestamp: new Date().toISOString(),
					relevance: 0.95
				});

				return {
					level: 'STOP',
					confidence: 0.95,
					reasoning: 'TypeScript projects typically do not require npm build - this is a repeatedly identified violation pattern',
					evidence
				};
			}
		}

		return { level: 'PROCEED', evidence };
	}

	/**
	 * Assess user feedback patterns for similar commands
	 */
	private async assessUserFeedbackPatterns(command: string): Promise<Partial<ViolationRisk> & { evidence: ViolationEvidence[] }> {
		const evidence: ViolationEvidence[] = [];

		try {
			// Search for user corrections related to similar commands
			const feedbackMatches = await this.memory.searchTiered(
				`user correction ${command.split(' ')[0]}`,
				{ threshold: 0.036, limit: 3 }
			);

			if (feedbackMatches && feedbackMatches.results) {
				for (const match of feedbackMatches.results) {
					evidence.push({
						type: 'user_feedback',
						description: `User feedback: ${match.content}`,
						timestamp: match.timestamp || new Date().toISOString(),
						relevance: match.similarity || 0.5
					});
				}
			}
		} catch (error) {
			console.warn('Error searching user feedback patterns:', error);
		}

		return { 
			level: evidence.length > 0 ? 'CAUTION' : 'PROCEED',
			evidence 
		};
	}

	/**
	 * Generate recommendations based on assessment
	 */
	private generateRecommendations(command: string, riskLevel: ViolationRisk['level'], projectContext: ProjectContext): string[] {
		const recommendations: string[] = [];

		if (riskLevel === 'STOP') {
			recommendations.push('Do not proceed with this command due to high violation risk');
			
			// TypeScript + npm build specific recommendations
			if (projectContext.type === 'typescript' && command.includes('npm') && command.includes('build')) {
				recommendations.push('TypeScript projects typically use direct TypeScript compilation or deployment scripts');
				recommendations.push('Consider using wrangler deploy for Cloudflare Workers or direct tsc if needed');
			}
		}

		if (riskLevel === 'CAUTION') {
			recommendations.push('Proceed with caution - potential violation risk detected');
			recommendations.push('Consider checking memory for similar past issues');
		}

		if (riskLevel === 'ASK') {
			recommendations.push('Request user guidance before proceeding');
			recommendations.push('Unclear if this action aligns with established patterns');
		}

		return recommendations;
	}

	/**
	 * Detect project context for risk assessment
	 */
	private async detectProjectContext(): Promise<ProjectContext> {
		// This would typically examine the file system, but for now return a basic implementation
		return {
			type: 'typescript', // Default assumption based on repository context
			hasPackageJson: true,
			hasTsConfig: true,
			buildTools: ['wrangler', 'typescript']
		};
	}

	/**
	 * Store assessment result for learning
	 */
	async recordAssessmentOutcome(
		command: string, 
		assessment: ViolationRisk, 
		actualOutcome: 'violation' | 'success' | 'user_intervention'
	): Promise<void> {
		const feedbackData = {
			command,
			assessmentLevel: assessment.level,
			assessmentConfidence: assessment.confidence,
			actualOutcome,
			timestamp: new Date().toISOString()
		};

		await this.memory.storeKnowledge(
			`Assessment feedback: ${command} assessed as ${assessment.level}, outcome: ${actualOutcome}`,
			{
				type: 'assessment_feedback',
				accuracy: assessment.level === 'STOP' && actualOutcome === 'violation' ? 'correct' : 'needs_review',
				...feedbackData
			},
			['assessment-feedback', 'learning', 'violation-prevention']
		);
	}
}
