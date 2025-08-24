/**
 * TierMapper
 * 
 * Maps cognitive tiers (axiom/long/intermediate/short) to persistence tiers
 * (Foundation/Adaptive/Ephemeral) per ADR-003, and coordinates promotion actions.
 */

export type CognitiveTier = 'axiom' | 'long' | 'intermediate' | 'short';
export type PersistenceTier = 'foundation' | 'adaptive' | 'ephemeral';

export interface TierMetadata {
	importance: number; // 0..1
	accessCount: number;
	lastAccess: string; // ISO
	type: 'claim' | 'rule' | 'verification' | 'pattern' | 'assumption' | 'knowledge';
	policyFlags?: { forceFoundation?: boolean };
}

export interface TierDecision {
	cognitiveTier: CognitiveTier;
	persistenceTier: PersistenceTier;
	actions: Array<'writeThrough' | 'checkpoint' | 'promote' | 'validate' | 'none'>;
	reasons: string[];
}

export class TierMapper {
	map(metadata: TierMetadata): TierDecision {
		const { importance, accessCount, type, policyFlags } = metadata;

		// Determine cognitive tier first (basic rule; actual system may pass known tier)
		const cognitiveTier = this.selectCognitiveTier(importance, accessCount);

		// Map to persistence tier per ADR-003
		let persistenceTier: PersistenceTier = 'ephemeral';
		const reasons: string[] = [];
		const actions: TierDecision['actions'] = [];

		if (cognitiveTier === 'axiom') {
			persistenceTier = 'foundation';
			reasons.push('Axiom items always persisted to Foundation');
			actions.push('checkpoint');
		} else if (cognitiveTier === 'long') {
			if (importance >= 0.85 || policyFlags?.forceFoundation) {
				persistenceTier = 'foundation';
				reasons.push('High-importance long-term → Foundation');
				actions.push('validate', 'checkpoint');
			} else {
				persistenceTier = 'adaptive';
				reasons.push('Long-term default → Adaptive');
				actions.push('writeThrough');
			}
		} else if (cognitiveTier === 'intermediate') {
			persistenceTier = 'adaptive';
			reasons.push('Intermediate → Adaptive');
			actions.push('writeThrough');
		} else {
			persistenceTier = 'ephemeral';
			reasons.push('Short-term → Ephemeral');
		}

		// Cross-boundary promotions
		if ((cognitiveTier === 'short' && accessCount >= 3) || (cognitiveTier === 'intermediate' && accessCount >= 5)) {
			actions.push('promote');
			reasons.push('Access-driven promotion condition met');
		}

		return { cognitiveTier, persistenceTier, actions, reasons };
	}

	selectCognitiveTier(importance: number, accessCount: number): CognitiveTier {
		if (importance >= 0.9) return 'axiom';
		if (importance >= 0.7) return 'long';
		if (importance >= 0.3) return 'intermediate';
		return 'short';
	}
}
