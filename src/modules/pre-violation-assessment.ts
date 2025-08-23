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
	 * Assess file operation for violation risk - Phase 2 Implementation
	 */
	async assessFileOperation(
		operation: 'create' | 'edit' | 'delete' | 'move' | 'copy',
		filePath: string,
		context?: Record<string, unknown>
	): Promise<ViolationRisk> {
		// Initialize project context if not available
		if (!this.projectContext) {
			this.projectContext = await this.detectProjectContext();
		}

		const evidence: ViolationEvidence[] = [];
		let riskLevel: ViolationRisk['level'] = 'PROCEED';
		let confidence = 0.5;
		let reasoning = 'No specific file operation risk patterns detected';

		// 1. Check for file-specific violation patterns
		const fileViolationPatterns = await this.searchFileViolationPatterns(operation, filePath);
		if (fileViolationPatterns.length > 0) {
			evidence.push(...fileViolationPatterns);
			
			// High-risk file operations
			if (this.isHighRiskFileOperation(operation, filePath, this.projectContext)) {
				riskLevel = 'STOP';
				confidence = 0.9;
				reasoning = 'Known high-risk file operation pattern detected in memory';
			} else {
				riskLevel = 'CAUTION';
				confidence = 0.7;
				reasoning = 'Potential file operation risk pattern identified';
			}
		}

		// 2. Critical file protection
		const criticalFileRisk = this.assessCriticalFileRisk(operation, filePath, this.projectContext);
		if (criticalFileRisk.level !== 'PROCEED') {
			evidence.push(...criticalFileRisk.evidence);
			if (criticalFileRisk.level === 'STOP') {
				riskLevel = 'STOP';
				confidence = Math.max(confidence, criticalFileRisk.confidence || 0.9);
				reasoning = criticalFileRisk.reasoning || 'Critical file operation risk';
			}
		}

		// 3. Project structure integrity
		const structureRisk = await this.assessProjectStructureRisk(operation, filePath, context);
		if (structureRisk.evidence.length > 0) {
			evidence.push(...structureRisk.evidence);
			if (structureRisk.level === 'STOP' && riskLevel !== 'STOP') {
				riskLevel = 'CAUTION';
				confidence = Math.max(confidence, 0.7);
			}
		}

		return {
			level: riskLevel,
			confidence,
			reasoning,
			recommendations: this.generateFileOperationRecommendations(operation, filePath, riskLevel, this.projectContext),
			evidence
		};
	}

	/**
	 * Real-time guidance for ongoing actions - Phase 2 Implementation
	 */
	async getRealtimeGuidance(
		actionType: 'terminal_command' | 'file_operation' | 'user_interaction',
		actionDetails: string,
		currentContext?: Record<string, unknown>
	): Promise<{
		guidance: 'continue' | 'pause' | 'modify' | 'stop';
		reasoning: string;
		suggestions?: string[];
		urgency: 'low' | 'medium' | 'high' | 'critical';
	}> {
		try {
			// Search for real-time guidance patterns
			const guidancePatterns = await this.memory.searchTiered(
				`realtime guidance ${actionType} ${actionDetails}`,
				{ threshold: 0.05, limit: 5 }
			);

			const interruptionPatterns = await this.memory.searchTiered(
				`interruption ${actionType} violation`,
				{ threshold: 0.05, limit: 3 }
			);

			let guidance: 'continue' | 'pause' | 'modify' | 'stop' = 'continue';
			let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
			let reasoning = 'No intervention patterns detected';
			const suggestions: string[] = [];

			// Analyze interruption patterns
			if (interruptionPatterns && interruptionPatterns.results && interruptionPatterns.results.length > 0) {
				urgency = 'high';
				guidance = 'pause';
				reasoning = 'Historical interruption patterns suggest pausing for review';
				suggestions.push('Review memory for similar past issues');
				suggestions.push('Consider user consultation before proceeding');
			}

			// Analyze guidance patterns
			if (guidancePatterns && guidancePatterns.results) {
				for (const pattern of guidancePatterns.results) {
					if (pattern.content.includes('stop') || pattern.content.includes('halt')) {
						guidance = 'stop';
						urgency = 'critical';
						reasoning = 'Memory patterns strongly suggest stopping this action';
						break;
					} else if (pattern.content.includes('modify') || pattern.content.includes('adjust')) {
						if (guidance === 'continue' || guidance === 'pause') {
							guidance = 'modify';
							urgency = 'medium';
							reasoning = 'Memory patterns suggest modifications to approach';
						}
					}
				}
			}

			// Log real-time guidance request
			await this.memory.logClaim(
				`Real-time guidance: ${actionType} "${actionDetails}" - ${guidance} (${urgency} urgency)`,
				{
					actionType,
					actionDetails,
					guidance,
					urgency,
					patternCount: (guidancePatterns?.results?.length || 0) + (interruptionPatterns?.results?.length || 0),
					currentContext
				},
				'realtime guidance',
				'medium'
			);

			return {
				guidance,
				reasoning,
				...(suggestions.length > 0 && { suggestions }),
				urgency
			};

		} catch (error) {
			// Fail-safe: if guidance system fails, be conservative
			return {
				guidance: 'pause',
				reasoning: `Guidance system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				suggestions: ['Proceed with manual caution due to guidance system failure'],
				urgency: 'medium'
			};
		}
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

	// Phase 2 Implementation - File Operation Assessment Methods

	/**
	 * Search memory for file operation violation patterns
	 */
	private async searchFileViolationPatterns(operation: string, filePath: string): Promise<ViolationEvidence[]> {
		const evidence: ViolationEvidence[] = [];

		try {
			// Search for direct file operation violations
			const directMatches = await this.memory.searchTiered(
				`file ${operation} ${filePath} violation`,
				{ threshold: 0.036, limit: 5 }
			);

			if (directMatches && directMatches.results) {
				for (const match of directMatches.results) {
					evidence.push({
						type: 'violation_history',
						description: `Previous file operation violation: ${match.content}`,
						timestamp: match.timestamp || new Date().toISOString(),
						relevance: match.similarity || 0.5
					});
				}
			}

			// Search for file extension and type patterns
			const fileExtension = filePath.split('.').pop() || '';
			if (fileExtension) {
				const extensionMatches = await this.memory.searchTiered(
					`${operation} ${fileExtension} file violation`,
					{ threshold: 0.036, limit: 3 }
				);

				if (extensionMatches && extensionMatches.results) {
					for (const match of extensionMatches.results) {
						evidence.push({
							type: 'pattern_match',
							description: `File type pattern: ${match.content}`,
							timestamp: match.timestamp || new Date().toISOString(),
							relevance: (match.similarity || 0.5) * 0.8
						});
					}
				}
			}

		} catch (error) {
			console.warn('Error searching file violation patterns:', error);
		}

		return evidence;
	}

	/**
	 * Check for high-risk file operations
	 */
	private isHighRiskFileOperation(operation: string, filePath: string, projectContext: ProjectContext): boolean {
		// Critical system files
		const criticalFiles = [
			'package.json',
			'tsconfig.json',
			'wrangler.jsonc',
			'.gitignore',
			'README.md'
		];

		const fileName = filePath.split('/').pop() || '';
		
		// Deleting critical files is always high-risk
		if (operation === 'delete' && criticalFiles.includes(fileName)) {
			return true;
		}

		// Moving critical files is high-risk
		if (operation === 'move' && criticalFiles.includes(fileName)) {
			return true;
		}

		// Editing certain files without context is risky
		if (operation === 'edit') {
			if (fileName === 'package.json' || fileName === 'tsconfig.json') {
				return true;
			}
		}

		return false;
	}

	/**
	 * Assess critical file protection risks
	 */
	private assessCriticalFileRisk(operation: string, filePath: string, projectContext: ProjectContext): Partial<ViolationRisk> & { evidence: ViolationEvidence[] } {
		const evidence: ViolationEvidence[] = [];
		const fileName = filePath.split('/').pop() || '';

		// Define critical files by category
		const criticalFiles = {
			config: ['package.json', 'tsconfig.json', 'wrangler.jsonc', '.env'],
			source: ['index.ts', 'src/index.ts', 'src/mcp-server.ts'],
			documentation: ['README.md', 'DEPLOYMENT.md'],
			git: ['.gitignore', '.gitattributes']
		};

		// Check if file is critical
		let fileCategory: string | null = null;
		for (const [category, files] of Object.entries(criticalFiles)) {
			if (files.includes(fileName) || files.includes(filePath)) {
				fileCategory = category;
				break;
			}
		}

		if (fileCategory) {
			evidence.push({
				type: 'pattern_match',
				description: `Critical ${fileCategory} file operation: ${operation} on ${fileName}`,
				timestamp: new Date().toISOString(),
				relevance: 0.9
			});

			// High-risk operations on critical files
			if (operation === 'delete') {
				return {
					level: 'STOP',
					confidence: 0.95,
					reasoning: `Deleting critical ${fileCategory} file ${fileName} could break project functionality`,
					evidence
				};
			}

			if (operation === 'move' && fileCategory === 'config') {
				return {
					level: 'STOP',
					confidence: 0.9,
					reasoning: `Moving configuration file ${fileName} could break project setup`,
					evidence
				};
			}

			if (operation === 'edit' && fileCategory === 'config') {
				return {
					level: 'CAUTION',
					confidence: 0.8,
					reasoning: `Editing configuration file ${fileName} requires careful consideration`,
					evidence
				};
			}
		}

		return { level: 'PROCEED', evidence };
	}

	/**
	 * Assess project structure integrity risks
	 */
	private async assessProjectStructureRisk(operation: string, filePath: string, context?: Record<string, unknown>): Promise<Partial<ViolationRisk> & { evidence: ViolationEvidence[] }> {
		const evidence: ViolationEvidence[] = [];

		try {
			// Search for project structure violation patterns
			const structurePatterns = await this.memory.searchTiered(
				`project structure ${operation} violation`,
				{ threshold: 0.036, limit: 3 }
			);

			if (structurePatterns && structurePatterns.results) {
				for (const pattern of structurePatterns.results) {
					evidence.push({
						type: 'pattern_match',
						description: `Project structure pattern: ${pattern.content}`,
						timestamp: pattern.timestamp || new Date().toISOString(),
						relevance: pattern.similarity || 0.5
					});
				}
			}

			// Check for operations that could break project structure
			if (operation === 'delete' && filePath.includes('src/')) {
				evidence.push({
					type: 'pattern_match',
					description: 'Deleting source file could break project compilation',
					timestamp: new Date().toISOString(),
					relevance: 0.7
				});

				return {
					level: 'CAUTION',
					evidence
				};
			}

		} catch (error) {
			console.warn('Error assessing project structure risk:', error);
		}

		return { level: 'PROCEED', evidence };
	}

	/**
	 * Generate file operation specific recommendations
	 */
	private generateFileOperationRecommendations(operation: string, filePath: string, riskLevel: ViolationRisk['level'], projectContext: ProjectContext): string[] {
		const recommendations: string[] = [];
		const fileName = filePath.split('/').pop() || '';

		if (riskLevel === 'STOP') {
			recommendations.push('Do not proceed with this file operation due to high risk');
			
			if (operation === 'delete') {
				recommendations.push('Consider backing up the file before deletion');
				recommendations.push('Verify the file is not critical to project functionality');
			}

			if (fileName === 'package.json') {
				recommendations.push('Changes to package.json can break dependency management');
				recommendations.push('Use npm/yarn commands for dependency changes instead');
			}
		}

		if (riskLevel === 'CAUTION') {
			recommendations.push('Proceed with caution - potential file operation risk detected');
			recommendations.push('Consider creating a backup before making changes');
			
			if (operation === 'edit' && fileName.endsWith('.ts')) {
				recommendations.push('Ensure TypeScript compilation still works after changes');
			}
		}

		if (riskLevel === 'ASK') {
			recommendations.push('Request user guidance before proceeding with file operation');
			recommendations.push('Unclear if this file operation aligns with project best practices');
		}

		return recommendations;
	}
}
