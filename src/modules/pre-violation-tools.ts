/**
 * Copyright © 2025, Jonah Sullivan
 * 
 * Memory Tools for Pre-Violation Assessment
 * 
 * MCP tool implementations for proactive violation prevention.
 * These tools integrate with the Mnemosyne memory system to provide
 * pre-action assessment capabilities.
 */

import type { MnemosyneMemorySystem } from '../memory-tool.js';
import { PreViolationAssessment, type ViolationRisk } from './pre-violation-assessment.js';

/**
 * Assess a terminal command for violation risk before execution
 */
export async function memory_assess_terminal_command(
	memory: MnemosyneMemorySystem,
	command: string,
	context?: Record<string, unknown>
): Promise<{
	success: boolean;
	assessment: ViolationRisk;
	recommendation: string;
	shouldProceed: boolean;
}> {
	try {
		const assessor = new PreViolationAssessment(memory);
		const assessment = await assessor.assessTerminalCommand(command, context);

		// Determine if we should proceed
		const shouldProceed = assessment.level === 'PROCEED' || 
			(assessment.level === 'CAUTION' && assessment.confidence < 0.8);

		let recommendation = '';
		switch (assessment.level) {
			case 'PROCEED':
				recommendation = 'Safe to proceed - no violation risk detected';
				break;
			case 'CAUTION':
				recommendation = `Proceed with caution - ${assessment.reasoning}`;
				break;
			case 'STOP':
				recommendation = `Do not proceed - ${assessment.reasoning}`;
				break;
			case 'ASK':
				recommendation = `Ask user for guidance - ${assessment.reasoning}`;
				break;
		}

		// Log this assessment for learning
		await memory.logClaim(
			`Terminal command assessment: "${command}" assessed as ${assessment.level}`,
			{
				command,
				assessmentLevel: assessment.level,
				confidence: assessment.confidence,
				evidenceCount: assessment.evidence?.length || 0
			},
			'pre-violation assessment',
			'medium'
		);

		return {
			success: true,
			assessment,
			recommendation,
			shouldProceed
		};

	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : 'Unknown error';
		
		// Log assessment failure
		await memory.logClaim(
			`Pre-violation assessment failed for command: "${command}"`,
			{ error: errorMsg },
			'assessment system',
			'low'
		);

		return {
			success: false,
			assessment: {
				level: 'ASK',
				confidence: 0,
				reasoning: `Assessment failed: ${errorMsg}`,
				recommendations: ['Request user guidance due to assessment failure']
			},
			recommendation: 'Assessment system error - please proceed with caution and user oversight',
			shouldProceed: false
		};
	}
}

/**
 * Record the outcome of an assessed action for learning
 */
export async function memory_record_assessment_outcome(
	memory: MnemosyneMemorySystem,
	command: string,
	assessmentLevel: 'PROCEED' | 'CAUTION' | 'STOP' | 'ASK',
	actualOutcome: 'violation' | 'success' | 'user_intervention',
	details?: Record<string, unknown>
): Promise<{ success: boolean; learningSummary: string }> {
	try {
		const assessor = new PreViolationAssessment(memory);
		
		// Create a dummy assessment for the recorder
		const assessment = {
			level: assessmentLevel,
			confidence: 0.5, // Placeholder since we don't store this
			reasoning: 'Assessment outcome recording'
		};

		await assessor.recordAssessmentOutcome(command, assessment, actualOutcome);

		// Determine learning value
		let accuracy = 'unknown';
		if (assessmentLevel === 'STOP' && actualOutcome === 'violation') {
			accuracy = 'correct_prevention';
		} else if (assessmentLevel === 'PROCEED' && actualOutcome === 'success') {
			accuracy = 'correct_approval';
		} else if (assessmentLevel === 'STOP' && actualOutcome === 'success') {
			accuracy = 'false_positive';
		} else if (assessmentLevel === 'PROCEED' && actualOutcome === 'violation') {
			accuracy = 'false_negative';
		}

		const learningSummary = `Assessment learning: ${command} was assessed as ${assessmentLevel}, actual outcome: ${actualOutcome} (${accuracy})`;

		// Store learning data
		await memory.storeKnowledge(
			learningSummary,
			{
				type: 'assessment_learning',
				command,
				assessmentLevel,
				actualOutcome,
				accuracy,
				timestamp: new Date().toISOString(),
				...details
			},
			['assessment-learning', 'violation-prevention', 'self-improvement']
		);

		return {
			success: true,
			learningSummary
		};

	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : 'Unknown error';
		return {
			success: false,
			learningSummary: `Failed to record assessment outcome: ${errorMsg}`
		};
	}
}

/**
 * Check for violation patterns in proposed actions
 */
export async function memory_check_violation_patterns(
	memory: MnemosyneMemorySystem,
	actionType: 'terminal_command' | 'file_operation' | 'user_interaction',
	actionDescription: string,
	context?: Record<string, unknown>
): Promise<{
	success: boolean;
	riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	patterns: Array<{
		description: string;
		relevance: number;
		timestamp: string;
	}>;
	recommendations: string[];
}> {
	try {
		const patterns: Array<{
			description: string;
			relevance: number;
			timestamp: string;
		}> = [];

		// Search for violation patterns based on action type
		const searchTerm = `${actionType} ${actionDescription} violation`;
		const results = await memory.searchTiered(searchTerm, {
			threshold: 0.036,
			limit: 10
		});

		if (results && results.results) {
			for (const result of results.results) {
				patterns.push({
					description: result.content,
					relevance: result.similarity || 0,
					timestamp: result.timestamp || new Date().toISOString()
				});
			}
		}

		// Determine risk level based on patterns found
		let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
		if (patterns.length === 0) {
			riskLevel = 'LOW';
		} else if (patterns.length <= 2) {
			riskLevel = 'MEDIUM';
		} else if (patterns.length <= 5) {
			riskLevel = 'HIGH';
		} else {
			riskLevel = 'CRITICAL';
		}

		// Generate recommendations
		const recommendations: string[] = [];
		if (riskLevel === 'LOW') {
			recommendations.push('No significant violation patterns detected - proceed with normal caution');
		} else if (riskLevel === 'MEDIUM') {
			recommendations.push('Some violation patterns found - review patterns before proceeding');
		} else if (riskLevel === 'HIGH') {
			recommendations.push('Multiple violation patterns detected - exercise significant caution');
		} else {
			recommendations.push('Critical violation risk - strongly consider alternative approaches');
		}

		// Log the pattern check
		await memory.logClaim(
			`Violation pattern check: ${actionType} "${actionDescription}" - ${riskLevel} risk, ${patterns.length} patterns`,
			{
				actionType,
				actionDescription,
				riskLevel,
				patternCount: patterns.length,
				context
			},
			'violation pattern analysis',
			'medium'
		);

		return {
			success: true,
			riskLevel,
			patterns,
			recommendations
		};

	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : 'Unknown error';
		
		await memory.logClaim(
			`Violation pattern check failed for ${actionType}: "${actionDescription}"`,
			{ error: errorMsg },
			'pattern analysis system',
			'low'
		);

		return {
			success: false,
			riskLevel: 'MEDIUM',
			patterns: [],
			recommendations: ['Pattern check failed - proceed with manual caution']
		};
	}
}

/**
 * Get pre-action guidance based on memory and behavioral rules
 */
export async function memory_get_preaction_guidance(
	memory: MnemosyneMemorySystem,
	proposedAction: string,
	actionContext?: Record<string, unknown>
): Promise<{
	success: boolean;
	guidance: {
		recommendation: 'PROCEED' | 'MODIFY' | 'PAUSE' | 'STOP';
		reasoning: string;
		alternatives?: string[];
		requirements?: string[];
	};
	memoryEvidence: Array<{
		content: string;
		relevance: number;
		type: 'success_pattern' | 'failure_pattern' | 'user_feedback';
	}>;
}> {
	try {
		const memoryEvidence: Array<{
			content: string;
			relevance: number;
			type: 'success_pattern' | 'failure_pattern' | 'user_feedback';
		}> = [];

		// Search for relevant success and failure patterns
		const searchTerms = [
			`${proposedAction} success`,
			`${proposedAction} failure`,
			`${proposedAction} user feedback`
		];

		for (const term of searchTerms) {
			const results = await memory.searchKnowledge(term, {
				threshold: 0.036,
				limit: 5
			});

			if (results && results.results) {
				for (const result of results.results) {
					let evidenceType: 'success_pattern' | 'failure_pattern' | 'user_feedback' = 'success_pattern';
					if (term.includes('failure')) {
						evidenceType = 'failure_pattern';
					} else if (term.includes('user feedback')) {
						evidenceType = 'user_feedback';
					}

					memoryEvidence.push({
						content: result.content,
						relevance: result.similarity || 0,
						type: evidenceType
					});
				}
			}
		}

		// Analyze evidence to determine guidance
		const failures = memoryEvidence.filter(e => e.type === 'failure_pattern');
		const successes = memoryEvidence.filter(e => e.type === 'success_pattern');
		const feedback = memoryEvidence.filter(e => e.type === 'user_feedback');

		let recommendation: 'PROCEED' | 'MODIFY' | 'PAUSE' | 'STOP' = 'PROCEED';
		let reasoning = 'No specific guidance patterns found in memory';
		const alternatives: string[] = [];
		const requirements: string[] = [];

		if (failures.length > successes.length) {
			recommendation = 'PAUSE';
			reasoning = `More failure patterns (${failures.length}) than success patterns (${successes.length}) found`;
			alternatives.push('Review failure patterns before proceeding');
			alternatives.push('Consider alternative approaches');
		} else if (failures.length > 2) {
			recommendation = 'MODIFY';
			reasoning = `${failures.length} failure patterns detected - modifications recommended`;
			requirements.push('Address known failure modes');
		} else if (successes.length > 0) {
			recommendation = 'PROCEED';
			reasoning = `Success patterns found (${successes.length}) with minimal failures (${failures.length})`;
		}

		// Consider user feedback
		if (feedback.length > 0) {
			requirements.push('Consider user feedback patterns in implementation');
		}

		// Log the guidance request
		await memory.logClaim(
			`Pre-action guidance: "${proposedAction}" - ${recommendation}`,
			{
				proposedAction,
				recommendation,
				evidenceCount: memoryEvidence.length,
				failureCount: failures.length,
				successCount: successes.length,
				actionContext
			},
			'pre-action guidance',
			'medium'
		);

		return {
			success: true,
			guidance: {
				recommendation,
				reasoning,
				...(alternatives.length > 0 && { alternatives }),
				...(requirements.length > 0 && { requirements })
			},
			memoryEvidence
		};

	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : 'Unknown error';
		
		await memory.logClaim(
			`Pre-action guidance failed for: "${proposedAction}"`,
			{ error: errorMsg },
			'guidance system',
			'low'
		);

		return {
			success: false,
			guidance: {
				recommendation: 'PAUSE',
				reasoning: `Guidance system error: ${errorMsg}`
			},
			memoryEvidence: []
		};
	}
}
