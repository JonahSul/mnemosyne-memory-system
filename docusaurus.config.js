module.exports = {
  title: 'Mnemosyne Memory System',
  tagline: 'A memory system for retrieval-augmented applications',
  url: 'https://JonahSul.github.io',
  baseUrl: '/mnemosyne-memory-system/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'JonahSul',
  projectName: 'mnemosyne-memory-system',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/JonahSul/mnemosyne-memory-system/tree/main/',
          exclude: [
            '**/quick-start-rearchitecture.md',
            '**/resilient-memory-collaboration.md',
            '**/README.md',
            '**/local-development.md',
            '**/hybrid-search-policy.md',
            '**/adr/ADR-001-*.md',
            '**/adr/ADR-002-*.md',
            '**/adr/ADR-003-*.md',
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};