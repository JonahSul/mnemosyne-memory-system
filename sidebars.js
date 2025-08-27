module.exports = {
  docs: [
    'index',
    'quick-start',
    {
      type: 'category',
      label: 'Developer',
      items: [
        'development-guide',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'delegator-pattern',
        'multi-tier-memory',
        'cloudflare-worker-architecture',
      ],
    },
    'contributing-docs'
  ],
};