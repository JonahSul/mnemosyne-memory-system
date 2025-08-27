module.exports = {
  docs: [
    'index',
    'welcome-highlights',
    'quick-start',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'local-development',
        'development-guide',
        'quick-start-rearchitecture',
        'kv-namespace-setup',
        'mcp-tools-registry',
        'tools-registry'
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'technical-deep-dive-memory-architecture',
        'multi-tier-memory',
        'cloudflare-worker-architecture',
        'delegator-pattern',
        'foundation-v1.7.0-guide',
        'foundation-v16-scaffold'
      ],
    },
    {
      type: 'category',
      label: 'Memory Strategies & Policies',
      items: [
        'semantic-search',
        'hybrid-search-policy',
        'dynamic-threshold-tuning',
        'forgetting-curves-memory-persistence'
      ],
    },
    {
      type: 'category',
      label: 'RAG & AutoRAG',
      items: [
        'autorag-integration',
        'autorag-knowledge-extraction',
        'autorag-prompt-optimization'
      ],
    },
    {
      type: 'category',
      label: 'Resilience & Recovery',
      items: [
        'memory-system-recovery-2025-08-23',
        'resilient-memory-collaboration',
        'secured-r2-extraction-implementation'
      ],
    },
    {
      type: 'category',
      label: 'Governance & Schemas',
      items: [
        'identity-registry-schema',
        'federation-role-definitions',
        'behavioral-rules-system'
      ],
    },
    {
      type: 'category',
      label: 'Patterns & Tools',
      items: [
        'agent-collaboration-protocol',
        'mcp-tools-registry',
        'tools-registry',
        'close-terminal-implementation-guide'
      ],
    },
    'contributing-docs'
  ],
};