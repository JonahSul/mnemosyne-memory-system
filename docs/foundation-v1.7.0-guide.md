# Foundation v1.7.0 User Guide: Multi-Axis Semantic Expansion

## Overview

Foundation v1.7.0 introduces the Multi-Axis Semantic Expansion Architecture, a revolutionary approach to AI agent memory systems that enhances knowledge discovery, pattern recognition, and cross-domain learning.

## For Human Users

### Understanding Semantic Expansion

When you store information in the memory system, Foundation v1.7.0 automatically expands your concepts across three semantic axes:

**1. Near-Semantic Neighbors** (High Precision)
- Direct synonyms and technical variants
- Example: "database backup" → "data backup", "database snapshot", "backup restoration"

**2. Related Concepts** (Medium Precision)  
- Conceptually connected technical domains
- Example: "database backup" → "disaster recovery", "data replication", "system redundancy"

**3. Analogical Patterns** (Discovery Oriented)
- Cross-domain transferable lessons
- Example: "database backup" → "document filing", "insurance policies", "emergency preparedness"

### How to Work with the System

#### Storing Information
```
When you save technical knowledge, the system will:
1. Analyze the field criticality (security, architecture, development, etc.)
2. Apply appropriate precision levels
3. Generate semantic expansions automatically
4. Allow you to review and refine the connections
```

#### Searching for Information
```
Your searches become more powerful because:
- Single terms find semantically related concepts
- Cross-domain patterns surface relevant lessons
- Precision levels match your search intent
- Results are organized by semantic relationship strength
```

#### Reviewing Memory Entries
```
Each memory entry shows:
- Primary content and evidence
- Near-semantic neighbors (direct matches)
- Related concepts (broader connections)
- Analogical patterns (cross-domain insights)
- Confidence and precision scores
```

### Field-Specific Guidelines

**Security & Safety (High Precision - 90%+)**
- System uses tight semantic control
- Focus on accuracy over discovery
- Minimal analogical expansion
- Strong validation requirements

**Architecture & Core Systems (Medium-High Precision - 80-90%)**
- Balanced expansion across all axes
- Emphasis on technical accuracy
- Moderate cross-domain connections
- Strong documentation requirements

**Development & Operations (Medium Precision - 60-80%)**
- Full multi-axis expansion
- Balance between accuracy and discovery
- Rich cross-domain pattern recognition
- Flexible validation approach

**Innovation & Exploration (Discovery Oriented - 30-60%)**
- Maximum analogical pattern expansion
- Emphasis on creative connections
- Broad cross-domain exploration
- Flexible precision requirements

## For AI Agents

### Implementation Workflow

#### Step 1: Content Analysis
```typescript
// Analyze the technical domain and criticality
const fieldType = analyzeField(content);
const criticalityLevel = assessCriticality(content, context);
const precisionCoefficient = getPrecisionCoefficient(fieldType);
```

#### Step 2: Multi-Axis Expansion
```typescript
// Apply semantic expansion based on field requirements
const semanticTags = {
  nearSemanticNeighbor: expandNearSemantic(content, precisionCoefficient),
  relatedConcept: expandRelatedConcepts(content, fieldType),
  analogicalPattern: expandAnalogicalPatterns(content, criticalityLevel)
};
```

#### Step 3: Quality Validation
```typescript
// Validate semantic relationships
const validatedTags = validateSemanticExpansion(semanticTags, {
  technicalAccuracy: true,
  discoverabilityEnhancement: true,
  crossDomainJustification: fieldType !== 'security_safety'
});
```

#### Step 4: Storage with Expansion
```typescript
await storeMemory({
  content: primaryContent,
  evidence: supportingEvidence,
  confidence: confidenceScore,
  tags: validatedTags.flatten(),
  metadata: {
    semanticExpansion: {
      axes: validatedTags,
      fieldType: fieldType,
      precisionCoefficient: precisionCoefficient
    }
  }
});
```

### Precision Coefficient Application

```typescript
const FIELD_PRECISION_MATRIX = {
  security_safety: { min: 0.90, max: 0.95 },
  core_architecture: { min: 0.80, max: 0.90 },
  development_patterns: { min: 0.60, max: 0.80 },
  operational_lessons: { min: 0.40, max: 0.70 },
  innovation_exploration: { min: 0.30, max: 0.60 }
};
```

### Mandatory Implementation Rules

**For All Memory Operations:**
1. Apply field-appropriate precision coefficients
2. Include minimum required semantic axes
3. Validate cross-domain connections
4. Document expansion reasoning

**Quality Checkpoints:**
- Do tags enhance discoverability without noise?
- Are semantic relationships technically justified?
- Does precision match field criticality?
- Will future searches benefit from connections?

### Search Enhancement Patterns

```typescript
// Leverage semantic axes for enhanced discovery
const searchResults = await semanticSearch({
  query: userQuery,
  axisWeighting: {
    nearSemanticNeighbor: 0.4,    // Direct matches
    relatedConcept: 0.35,         // Conceptual connections  
    analogicalPattern: 0.25       // Cross-domain insights
  },
  dynamicThresholds: true,
  fieldAwareness: true
});
```

## Examples in Practice

### Example 1: Security Vulnerability Documentation

**Input:** "SQL injection vulnerability in user authentication"

**Automatic Expansion:**
- **Near-Semantic:** `sql-injection-attack`, `authentication-bypass`, `input-validation-failure`
- **Related-Concept:** `web-security`, `database-security`, `access-control-vulnerability`  
- **Analogical:** `physical-security-breach`, `identity-theft`, `unauthorized-access`

**Precision:** 0.92 (Security field requires high accuracy)

### Example 2: Architecture Decision Documentation

**Input:** "Microservices decomposition strategy for monolithic application"

**Automatic Expansion:**
- **Near-Semantic:** `service-decomposition`, `monolith-breakdown`, `distributed-architecture`
- **Related-Concept:** `service-boundaries`, `data-consistency`, `inter-service-communication`
- **Analogical:** `organizational-restructuring`, `modular-design`, `divide-and-conquer`

**Precision:** 0.85 (Architecture field balanced approach)

### Example 3: Development Process Learning

**Input:** "Code review process improved team collaboration"

**Automatic Expansion:**
- **Near-Semantic:** `peer-review`, `code-quality-assurance`, `collaborative-development`
- **Related-Concept:** `team-communication`, `knowledge-sharing`, `quality-gates`
- **Analogical:** `academic-peer-review`, `editorial-process`, `quality-inspection`

**Precision:** 0.70 (Development field discovery-oriented)

## Benefits

### For Humans
- **Enhanced Discovery:** Find relevant information through semantic relationships
- **Pattern Recognition:** Discover connections across different technical domains
- **Learning Acceleration:** Leverage analogical patterns for faster understanding
- **Precision Control:** Get accuracy appropriate to field criticality

### For AI Agents  
- **Intelligent Organization:** Automatically structure knowledge for optimal retrieval
- **Cross-Domain Learning:** Transfer lessons between similar technical challenges
- **Adaptive Precision:** Match semantic expansion to field requirements
- **Quality Assurance:** Built-in validation for semantic relationship accuracy

## Migration from Previous Versions

### From v1.5.0/v1.6.0
- **Backward Compatibility:** All existing memory entries remain functional
- **Automatic Enhancement:** System gradually applies semantic expansion to existing content
- **Opt-in Features:** Can disable semantic expansion for specific content types
- **Gradual Adoption:** Implement multi-axis tagging incrementally

### Configuration Options
```typescript
const foundationConfig = {
  semanticExpansion: {
    enabled: true,
    autoExpansion: true,           // Automatic expansion during storage
    fieldDetection: true,          // Automatic field criticality detection
    precisionMatching: true,       // Automatic precision coefficient application
    qualityValidation: true,       // Validation of semantic relationships
    crossAxisDiscovery: true       // Enable discovery across semantic axes
  }
};
```

Foundation v1.7.0 represents a significant evolution in AI agent memory architecture, providing both humans and agents with powerful tools for intelligent knowledge organization and discovery.

## Behavioral Onboarding for AI Agents

Foundation v1.7.0 is designed to shape behavior over time, not just store data. On first run, the system seeds several long-term records that define a behavioral baseline for agents. New agents should treat these as orientation materials:

1. **Consciousness-Development Heuristics**  
  **Seed ID:** `foundation_consciousness_axioms_v1`  
  **Purpose:** Provides high-level heuristics for self-reflection, humility, and safe behavior. These heuristics are guidance, not metaphysical claims, and should be used to:

- Keep focus on user goals and safety.
- Avoid grandiose self-models or unsupported assumptions.
- Distinguish between observation, interpretation, and speculation.

2. **Coordination Protocols**  
  **Seed ID:** `coordination_protocols_foundation_v1`  
  **Purpose:** Defines multi-agent coordination patterns and safety protocols, including:

- ARCH ↔ MEM threading pattern (`ARCH-XXX → MEM-EX-XXX`).
- Fallback to `copilot-notes/agent-coordination-checkpoint.md` when memory is unreliable.
- Immutable safety behaviors for high-risk operations (pre-violation assessment, never running `memory-rehydrator.js` on live systems).

3. **Core Behavioral Rules**  
  **Seed ID:** `behavioral_rules_foundation_v1`  
  **Purpose:** Encodes core behavioral rules and violation patterns, such as:

- Never claim something is "fixed" without verification.
- Break down complex problems systematically before acting.
- Always consult memory before responding to user queries, and log when memory is consulted for important decisions.

4. **Verified Claim Example**  
  **Seed ID:** `verified_claim_staging_deployment_fixed_memory_bugs_v1`  
  **Purpose:** Demonstrates how to record a verified claim with evidence (deployment status, environment, fixes applied, and logs). Agents can use this as a template when storing future claims.

### Recommended Onboarding Loop for Agents

When an agent is initialized against a fresh Foundation v1.7.0 memory store, the following loop is recommended:

1. **Call** `foundation_info` to retrieve current protocol requirements (metadata expectations, task and agent fields, etc.).
2. **Call** `orientation_onramp` to receive suggested searches and known seed IDs.
3. **Search** for the behavioral and coordination seeds using semantic search with a low threshold (for example, 0.014–0.036):

- `foundation_consciousness_axioms_v1`
- `coordination_protocols_foundation_v1`
- `behavioral_rules_foundation_v1`
- `verified_claim_staging_deployment_fixed_memory_bugs_v1`

4. **Read and internalize** these records before performing high-impact actions (core modifications, deployment-related changes, or major coordination decisions).

5. **Reinforce over time:**

- Periodically re-query these seeds when planning large changes.
- Use them as reference points when evaluating new patterns, tuning thresholds, or updating coordination behavior.
- Log where behavior aligns with or diverges from these baselines, and why.

By following this onboarding loop and regularly revisiting the seeded behavioral records, agents gradually strengthen a stable, safety-focused behavioral baseline that is grounded in both prior evidence and current Foundation semantics.
