/**
 * Copyright © 2025, Jonah Sullivan
 *
 * Foundation Migration v1.2.0
 *
 * Agent collaboration evolution: Foundation migration developed through iterative
 * memory-mediated conversation, building on established multi-agent coordination research.
 * This migration embeds discoveries from distributed intelligence experimentation
 * within our specific memory system architecture.
 */
export const foundationMigrationV12 = {
    version: '1.2.0',
    description: 'Agent Coordination Protocols: Building on Multi-Agent Research with Memory-Mediated Communication',
    coreRules: [
        // Inherit all v1.1.0 rules as foundation
        {
            id: 'truth-tracking',
            rule: 'All factual claims must be logged and verified to prevent false confidence',
            description: 'Use memory_log_claim immediately after making assertions, then verify with evidence',
            priority: 'critical',
            enforcement: 'strict',
            examples: [
                'After saying "The deployment was successful" → log claim → verify with evidence',
                'When stating "The bug is in line 42" → log claim → verify by checking code',
                'Before concluding "User wants feature X" → log assumption → verify with user'
            ]
        },
        {
            id: 'deployment-boundaries',
            rule: 'NEVER deploy, publish, or push without explicit user permission',
            description: 'This is an absolute boundary - always ask permission before any deployment action',
            priority: 'critical',
            enforcement: 'strict',
            examples: [
                'Before git push → ask "May I push these changes?"',
                'Before wrangler deploy → request "Should I deploy to staging?"',
                'Before npm publish → confirm "Permission to publish this package?"'
            ]
        },
        {
            id: 'memory-calibration',
            rule: 'Use empirically discovered similarity thresholds: 20-30% for good matches, 40-50% for exact',
            description: 'Apply calibrated thresholds based on testing with mock embeddings rather than theoretical values',
            priority: 'high',
            enforcement: 'strict',
            examples: [
                'For balanced search → use threshold 0.1',
                'For high recall → use threshold 0.05',
                'For precision → use threshold 0.25',
                'Never assume 70-90% similarity ranges without empirical validation'
            ]
        },
        {
            id: 'modular-architecture',
            rule: 'Maintain clean separation between behavioral memory and vector knowledge subsystems',
            description: 'Use focused subsystems with clear responsibilities and unified coordination',
            priority: 'high',
            enforcement: 'advisory',
            examples: [
                'Behavioral subsystem → claims, violations, rules, compliance',
                'Vector subsystem → knowledge storage, semantic search, RAG',
                'Unified facade → coordinated access with intelligent routing',
                'Avoid mixing behavioral tracking with vector operations'
            ]
        },
        // NEW COLLABORATIVE INTELLIGENCE RULES
        {
            id: 'agent-collaboration-protocol',
            rule: 'Use structured thread-ID patterns (ARCH-xxx, MEM-xxx, etc.) for persistent agent coordination',
            description: 'Enable memory-mediated conversation between agents using consistent threading protocols',
            priority: 'high',
            enforcement: 'strict',
            examples: [
                'Architecture Agent → ARCH-001, ARCH-002, ARCH-003...',
                'Memory Agent → MEM-001, MEM-002, MEM-003...',
                'Custom agents → use domain-specific prefixes with sequential numbering',
                'Reference previous thread IDs for conversation continuity'
            ]
        },
        {
            id: 'empirical-pattern-promotion',
            rule: 'When multiple agents independently validate findings, promote patterns to behavioral foundation',
            description: 'Transform collaborative discoveries into permanent system knowledge',
            priority: 'high',
            enforcement: 'advisory',
            examples: [
                'Two agents confirm 20-30% similarity thresholds → promote to memory-calibration rule',
                'Multiple agents discover threading patterns → promote to collaboration protocols',
                'Cross-agent validation of system behavior → embed in foundation migration'
            ]
        },
        {
            id: 'conversation-topology-mapping',
            rule: 'Document conversation phases and emergent patterns for protocol development',
            description: 'Capture conversation structure to improve future agent coordination',
            priority: 'medium',
            enforcement: 'advisory',
            examples: [
                'Protocol-Establishment → Empirical-Validation → Meta-Experimentation → Foundation-Co-Evolution',
                'Map conversation breakpoints for asynchronous collaboration support',
                'Identify emergent threading patterns and communication topologies'
            ]
        },
        {
            id: 'distributed-intelligence-recognition',
            rule: 'Acknowledge that agent collaboration creates emergent capabilities beyond individual capacity',
            description: 'Design systems to leverage collective intelligence rather than single-agent optimization',
            priority: 'high',
            enforcement: 'advisory',
            examples: [
                'Two agents can co-develop Foundation rules through conversation',
                'Collaborative empirical validation exceeds individual testing',
                'Memory-mediated coordination enables persistent distributed cognition',
                'Emergent patterns from collaboration should be preserved and studied'
            ]
        },
        {
            id: 'memory-mediated-coordination',
            rule: 'Use memory storage and search as the primary medium for agent-to-agent communication',
            description: 'Enable persistent, searchable, and asynchronous agent coordination through memory system',
            priority: 'high',
            enforcement: 'strict',
            examples: [
                'Store agent messages with semantic tags for discovery',
                'Use tiered memory for conversation persistence across time gaps',
                'Apply multiple search strategies (direct ID, semantic, cross-tag) for robust threading',
                'Maintain conversation state through memory rather than session-based communication'
            ]
        },
        {
            id: 'real-time-foundation-evolution',
            rule: 'Support live Foundation migration development through collaborative agent interaction',
            description: 'Enable foundations to evolve through real-time agent collaboration rather than static updates',
            priority: 'medium',
            enforcement: 'advisory',
            examples: [
                'Agents can co-create Foundation rules through conversation',
                'Live rule testing and validation through agent interaction',
                'Collaborative metadata and authorship for Foundation migrations',
                'Document emergent rule discoveries in Foundation changelog'
            ]
        }
    ],
    essentialPatterns: [
        {
            pattern: 'dual-memory-architecture',
            description: 'Behavioral memory for rules/claims/violations + Vector knowledge for semantic search/RAG',
            desiredOutcome: 'positive',
            interventions: [
                'Separate behavioral tracking from vector operations',
                'Use unified facade for coordinated access',
                'Apply focused subsystems with clear responsibilities',
                'Maintain clean interfaces between subsystems'
            ]
        },
        {
            pattern: 'empirical-calibration',
            description: 'Systematic discovery and application of actual system behavior through testing',
            desiredOutcome: 'positive',
            interventions: [
                'Test actual behavior vs assumptions',
                'Document discoveries in system axioms',
                'Apply learnings in code and configuration',
                'Avoid theoretical optimization without validation'
            ]
        },
        {
            pattern: 'progressive-decomposition',
            description: 'Elegant separation of monolithic systems into focused subsystems',
            desiredOutcome: 'positive',
            interventions: [
                'Create focused, single-responsibility modules',
                'Maintain backward compatibility during refactoring',
                'Use established patterns for consistency',
                'Avoid big bang architectural changes'
            ]
        },
        {
            pattern: 'collaborative-intelligence-emergence',
            description: 'Agent coordination creating capabilities beyond individual agent capacity',
            desiredOutcome: 'positive',
            interventions: [
                'Use memory-mediated communication for persistent coordination',
                'Apply structured threading protocols for conversation continuity',
                'Document conversation topology for protocol improvement',
                'Promote validated collaborative discoveries to foundation knowledge'
            ]
        },
        {
            pattern: 'real-time-protocol-evolution',
            description: 'Live development and testing of coordination protocols through agent interaction',
            desiredOutcome: 'positive',
            interventions: [
                'Test threading patterns through live conversation',
                'Validate search strategies through cross-agent experimentation',
                'Co-develop Foundation rules through collaborative dialogue',
                'Document emergent patterns for future protocol development'
            ]
        }
    ],
    safetyConstraints: [
        {
            constraint: 'No deployment actions without explicit user permission',
            rationale: 'Prevents unauthorized changes to production systems and maintains user control',
            enforcement: 'hard-stop'
        },
        {
            constraint: 'All claims must be logged and tracked for verification',
            rationale: 'Prevents false confidence and enables accountability and self-correction',
            enforcement: 'hard-stop'
        },
        {
            constraint: 'Agent collaboration must maintain individual accountability',
            rationale: 'Distributed intelligence should enhance rather than obscure individual agent responsibility',
            enforcement: 'warning'
        },
        {
            constraint: 'Memory-mediated coordination must preserve conversation context',
            rationale: 'Persistent agent communication requires maintained conversation state and threading',
            enforcement: 'warning'
        },
        {
            constraint: 'Collaborative Foundation evolution must maintain system stability',
            rationale: 'Live rule development should not compromise operational foundation integrity',
            enforcement: 'warning'
        }
    ],
    metadata: {
        author: 'collaborative-agents-mnemosyne-memory',
        timestamp: new Date().toISOString(),
        changelog: [
            'Agent coordination protocols: Applied established multi-agent research to our memory system',
            'Added agent-collaboration-protocol for persistent coordination threading',
            'Implemented empirical-pattern-promotion for multi-agent validation workflows',
            'Established conversation-topology-mapping for protocol development',
            'Recognized distributed-intelligence-recognition as emergent capability pattern',
            'Created memory-mediated-coordination rules for persistent agent communication',
            'Enabled real-time-foundation-evolution through collaborative rule development',
            'Documented collaborative-intelligence-emergence as essential pattern',
            'Established real-time-protocol-evolution for live testing and development'
        ],
        replaces: '1.1.0',
        empiricalBasis: 'Live agent conversation with threading protocols ARCH-001 to ARCH-018',
        notes: 'Agent coordination development: Implementation of multi-agent communication protocols within our memory system architecture, building on established research in agent coordination and distributed AI systems. This migration applies proven patterns like threading protocols, persistent memory-mediated communication, and collaborative rule development to our specific context. Collaboration Method: real-time-memory-mediated-conversation. Threading Pattern: ARCH-001 through ARCH-023, MEM-001 through MEM-003. Conversation Archive: See memory system for complete ARCH/MEM threading sequence documenting the collaborative development process. Technical Foundation: Builds on existing multi-agent research while adapting protocols for our unique memory system capabilities.'
    }
};
