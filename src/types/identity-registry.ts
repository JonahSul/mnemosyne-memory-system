/**
 * Identity Registry & Cell Attribution Types
 * 
 * TypeScript interfaces for the KV-based identity and cell attribution system.
 * These types define the schema for secure agent identification and memory attribution.
 */

// ============================================================================
// CORE IDENTITY TYPES
// ============================================================================

export interface AgentIdentity {
  // System-assigned unique identifier
  agentId: string;
  
  // Cryptographic identity factors (system-generated)
  cryptographic: {
    publicKey: string;           // Ed25519 public key (system-generated)
    keyFingerprint: string;      // SHA-256 of public key
    sessionToken: string;        // Rotating session identifier
    lastRotation: string;        // ISO timestamp of last token rotation
  };
  
  // Behavioral fingerprint (system-computed)
  behavioral: {
    interactionPatterns: number[];    // Vector of interaction characteristics
    responseTimings: number[];        // Statistical response time patterns
    memoryAccessPatterns: string[];   // Types of memory operations performed
    confidenceDistribution: number[]; // Histogram of confidence scores used
  };
  
  // Trust and reputation (system-maintained)
  trust: {
    trustScore: number;              // 0.0-1.0 system confidence in identity
    verificationCount: number;       // Number of successful verifications
    violationCount: number;          // Number of detected violations
    lastVerified: string;           // ISO timestamp of last verification
  };
  
  // Cell attribution metadata
  cells: {
    ownedCells: string[];           // Cell IDs owned by this agent
    contributionCount: number;      // Total memory contributions
    reputationByCell: Record<string, number>; // Per-cell reputation scores
  };
  
  // System metadata
  system: {
    created: string;               // ISO timestamp of identity creation
    lastActive: string;           // ISO timestamp of last activity
    version: string;              // Identity schema version
  };
}

// ============================================================================
// CELL BOUNDARY TYPES
// ============================================================================

export type BoundaryType = 'spherical' | 'ellipsoidal' | 'hyperplane';

export interface CellBoundary {
  // Cell identification
  cellId: string;
  ownerId: string;                 // agentId of cell owner
  
  // Mathematical boundary definition
  boundary: {
    centerVector: number[];        // 768-dim vector defining cell center
    radiusVector: number[];        // 768-dim vector defining cell shape/extent
    boundaryType: BoundaryType;
    boundaryParameters: Record<string, number>; // Type-specific parameters
  };
  
  // Access and attribution rules
  access: {
    readable: boolean;             // Always true for universal accessibility
    writable: boolean;             // Can others contribute to this cell?
    attributionRequired: boolean;  // Must contributions be attributed?
  };
  
  // Cell metadata
  metadata: {
    created: string;
    lastModified: string;
    description?: string;
    tags: string[];
  };
  
  // Statistics
  stats: {
    memoryCount: number;          // Number of memories in this cell
    contributorCount: number;     // Number of different contributors
    lastActivity: string;         // ISO timestamp of last memory addition
  };
}

// ============================================================================
// MEMORY ATTRIBUTION TYPES
// ============================================================================

export type VerificationMethod = 'cryptographic' | 'behavioral' | 'cross_reference';

export interface MemoryAttribution {
  // Memory identification
  memoryId: string;              // Links to Vectorize memory record
  vectorizeId: string;           // Vectorize record ID
  
  // Attribution data
  attribution: {
    authorId: string;            // agentId of memory author
    cellId: string;              // Cell containing this memory
    signature: string;           // Cryptographic signature of memory content
    timestamp: string;           // ISO timestamp of contribution
  };
  
  // Verification data
  verification: {
    verificationMethod: VerificationMethod;
    verificationScore: number;   // 0.0-1.0 confidence in attribution
    verifiedBy: string;          // System component that verified
    verifiedAt: string;          // ISO timestamp of verification
  };
  
  // Cell boundary validation
  spatial: {
    position: number[];          // 768-dim vector position in embedding space
    cellDistance: number;        // Distance from cell center
    withinBoundary: boolean;     // Is memory within claimed cell boundary?
  };
}

// ============================================================================
// SESSION MANAGEMENT TYPES
// ============================================================================

export interface ActiveSession {
  sessionId: string;
  agentId: string;
  
  // Authentication state
  auth: {
    publicKey: string;
    challenge: string;           // Current cryptographic challenge
    challengeExpiry: string;     // ISO timestamp
    verified: boolean;
  };
  
  // Session activity
  activity: {
    startTime: string;
    lastActivity: string;
    operationCount: number;
    memoryContributions: string[]; // Memory IDs contributed this session
  };
  
  // Behavioral tracking
  behavioral: {
    currentPatterns: number[];    // Live behavioral fingerprint
    deviationScore: number;      // Deviation from known patterns
    suspiciousActivity: boolean;
  };
}

// ============================================================================
// KV NAMESPACE TYPES
// ============================================================================

export type KVNamespace = 'identity' | 'cell' | 'attribution' | 'session';

export interface KVKey {
  namespace: KVNamespace;
  type: string;
  id: string;
}

// ============================================================================
// IDENTITY REGISTRY OPERATIONS
// ============================================================================

export interface IdentityRegistryOperations {
  // Identity management
  createAgentIdentity(behavioral: Partial<AgentIdentity['behavioral']>): Promise<AgentIdentity>;
  getAgentIdentity(agentId: string): Promise<AgentIdentity | null>;
  updateAgentIdentity(agentId: string, updates: Partial<AgentIdentity>): Promise<void>;
  
  // Cryptographic operations
  generateKeyPair(): Promise<{ publicKey: string; privateKey: string; fingerprint: string }>;
  verifySignature(message: string, signature: string, publicKey: string): Promise<boolean>;
  rotateSessionToken(agentId: string): Promise<string>;
  
  // Cell boundary management
  createCellBoundary(ownerId: string, boundary: Omit<CellBoundary, 'cellId' | 'ownerId'>): Promise<CellBoundary>;
  getCellBoundaries(agentId: string): Promise<CellBoundary[]>;
  validateCellPlacement(position: number[], cellId: string): Promise<boolean>;
  
  // Memory attribution
  attributeMemory(memoryId: string, attribution: MemoryAttribution): Promise<void>;
  getMemoryAttribution(memoryId: string): Promise<MemoryAttribution | null>;
  verifyMemoryAttribution(memoryId: string): Promise<boolean>;
  
  // Session management
  createSession(agentId: string): Promise<ActiveSession>;
  getActiveSession(sessionId: string): Promise<ActiveSession | null>;
  updateSessionActivity(sessionId: string, activity: Partial<ActiveSession['activity']>): Promise<void>;
  validateSession(sessionId: string): Promise<boolean>;
  
  // Trust and reputation
  calculateTrustScore(agentId: string): Promise<number>;
  updateReputation(agentId: string, cellId: string, delta: number): Promise<void>;
  getTrustMetrics(agentId: string): Promise<AgentIdentity['trust']>;
}

// ============================================================================
// BOUNDARY CALCULATION UTILITIES
// ============================================================================

export interface BoundaryCalculator {
  isWithinBoundary(position: number[], boundary: CellBoundary['boundary']): boolean;
  calculateDistance(position: number[], center: number[]): number;
  optimizeBoundary(memories: Array<{ position: number[] }>): CellBoundary['boundary'];
}

// ============================================================================
// SECURITY VALIDATION TYPES
// ============================================================================

export interface SecurityValidation {
  identityValid: boolean;
  sessionValid: boolean;
  signatureValid: boolean;
  behavioralConsistent: boolean;
  cellBoundaryValid: boolean;
  trustScoreAcceptable: boolean;
  violations: string[];
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  details: SecurityValidation;
  timestamp: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface IdentityRegistryConfig {
  // Cryptographic settings
  keyAlgorithm: 'Ed25519';
  signatureAlgorithm: 'EdDSA';
  hashAlgorithm: 'SHA-256';
  
  // Session settings
  sessionTokenLength: number;
  sessionExpiryHours: number;
  challengeExpiryMinutes: number;
  
  // Trust scoring weights
  trustWeights: {
    cryptographic: number;
    behavioral: number;
    reputation: number;
  };
  
  // Boundary validation
  boundaryTolerances: {
    spherical: number;
    ellipsoidal: number;
    hyperplane: number;
  };
  
  // Security thresholds
  thresholds: {
    minimumTrustScore: number;
    behavioralDeviationLimit: number;
    maxViolationsBeforeSuspension: number;
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class IdentityRegistryError extends Error {
  constructor(
    message: string,
    public code: string,
    public agentId?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'IdentityRegistryError';
  }
}

export type IdentityErrorCode = 
  | 'AGENT_NOT_FOUND'
  | 'INVALID_SIGNATURE'
  | 'SESSION_EXPIRED'
  | 'TRUST_SCORE_TOO_LOW'
  | 'CELL_BOUNDARY_VIOLATION'
  | 'BEHAVIORAL_ANOMALY'
  | 'CRYPTOGRAPHIC_FAILURE'
  | 'ATTRIBUTION_CONFLICT';
