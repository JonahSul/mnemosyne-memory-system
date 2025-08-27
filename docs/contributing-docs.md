---
id: contributing-docs
title: Contributing to the docs
---

Guidelines to contribute documentation:

- Add new pages under docs/ as Markdown files. Docusaurus uses the filename id as the default doc id unless front-matter (id) is set.
- To update the sidebar, edit sidebars.js at the repository root. Keep the top-level pages 'index' and 'quick-start' in place.
- Add a short front-matter header to long documents with fields like 'title' and 'id' and optionally 'sidebar_position' and 'tags'. Example:

```
---
title: Example Doc
id: example-doc
sidebar_position: 2
---
```

- Keep docs focused on a single audience when possible. Add an 'Audience:' line near the top of the doc (e.g., 'Audience: Developer').
- For diagrams, include images in docs/img/ and reference them with standard Markdown: `![diagram](img/my-architecture.svg)`