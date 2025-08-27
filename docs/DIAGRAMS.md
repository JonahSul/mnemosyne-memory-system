# Diagrams and Architecture Images

This directory is the canonical place for architecture and sequence diagrams referenced from the top-level README.

Planned files:
- docs/diagrams/architecture.png — architecture overview (component boxes + data flow)
- docs/diagrams/executive-onepager.png — a one-slide summary image for executive presentations

Currently, these files are represented by docs/diagrams/.placeholder until actual diagrams are created.

Guidance for contributors:
- Create diagrams in your preferred tool (Figma, draw.io, Mermaid exported PNG, etc.) and export as PNG or SVG.
- Commit diagrams under docs/diagrams/ and reference them by path from the README or executive brief.
- If you update diagrams, update this file with a short changelog entry.

Example commit command:
  git add docs/diagrams/architecture.png && git commit -m "docs(diagrams): add architecture diagram"