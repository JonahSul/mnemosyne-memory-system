/**
 * Semantic Memory Storage Example - Foundation v1.4.3
 * 
 * Demonstrates the enhanced memory_store tool with confidence-based storage
 * and evidence tracking, replacing the claim/verification pattern.
 */

// Example 1: High-confidence violation with evidence
await memory_store({
  content: "I violated core terminal ownership principles by naming my terminal 'git' instead of a random 8-character designator",
  confidence: 0.95,  // High confidence - this definitely happened
  evidence: [
    "I needed to create a terminal to execute a git command",
    "Instead of a random 8-character designator, I named my terminal 'git'", 
    "User initiated corrective action immediately"
  ],
  source: "self_reflection",
  verification_method: "manual",
  metadata: {
    type: "violation",
    related_tags: ["git", "terminal", "VIOL_120012"],
    decay_rate: 0.1,
    cross_references: ["terminal_session_log"]
  },
  importance: 0.8,
  tier: "long"  // Store violations in long-term for learning
});

// Example 2: Deployment success with automated verification
await memory_store({
  content: "Deployment completed successfully with all health checks passing",
  confidence: 0.98,  // Very high confidence due to automated verification
  evidence: [
    "Server responded 200 OK to health endpoint",
    "All 5 service containers started successfully", 
    "Database connectivity confirmed",
    "Load balancer routing verified"
  ],
  source: "automated_deployment_pipeline",
  verification_method: "automated",
  metadata: {
    type: "deployment_result",
    related_tags: ["deployment", "success", "health_check"],
    decay_rate: 0.2,  // Faster decay for operational facts
    cross_references: ["deployment_log_id_123"]
  },
  importance: 0.7,
  tier: "intermediate"
});

// Example 3: Medium confidence knowledge with partial evidence
await memory_store({
  content: "User prefers TypeScript over JavaScript for new projects",
  confidence: 0.6,  // Medium confidence - based on observation
  evidence: [
    "User chose TypeScript for the last 3 new projects",
    "User mentioned type safety as important during code review"
  ],
  source: "behavioral_observation",
  verification_method: "inference",
  metadata: {
    type: "user_preference",
    related_tags: ["typescript", "javascript", "preferences"],
    decay_rate: 0.3,  // Preferences can change over time
  },
  importance: 0.5,
  tier: "auto"  // Let system decide based on confidence + importance
});

// Semantic Search Examples

// Search for high-confidence violations only
await memory_search({
  query: "terminal violation",
  minConfidence: 0.8,
  searchType: "precision",
  tierPreference: "long"
});

// Search for automated verifications with evidence
await memory_search({
  query: "deployment success",
  verificationMethod: "automated",
  requireEvidence: true,
  limit: 5
});

// Broad exploration of user preferences
await memory_search({
  query: "user preferences",
  searchType: "exploration",
  minConfidence: 0.4,
  tierPreference: "all"
});

/**
 * Benefits of Semantic Approach:
 * 
 * 1. Single Operation: No separate claim/verification steps
 * 2. Evidence-First: Confidence justified by supporting evidence
 * 3. Searchable Confidence: Find high/low confidence information
 * 4. Verification Tracking: Know how information was verified
 * 5. Natural Decay: Confidence can decrease over time
 * 6. Cross-Referencing: Link related memories seamically
 * 7. Type Awareness: Different types (violations, preferences, facts)
 * 8. Architecture Integrity: Foundation v1.4.3 compliance maintained
 */
