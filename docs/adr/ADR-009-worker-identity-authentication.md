# ADR-009: Worker Identity and Authentication

**Status**: Proposed  
**Date**: 2025-08-24  
**Extracted from**: [ADR-007: Decentralized Global Federation](ADR-007-decentralized-global-federation.md)  
**Related ADRs**: [ADR-006](ADR-006-distributed-knowledge-network-architecture.md), [ADR-007](ADR-007-decentralized-global-federation.md), [ADR-014](ADR-014-cross-cluster-competency-reputation.md)

## Table of Contents

- [Context](#context)
- [Decision](#decision)
- [Core Identity Framework](#core-identity-framework)
- [Registration Process](#registration-process)
- [Authentication Protocol](#authentication-protocol)
- [Competency Integration](#competency-integration)
- [Security Considerations](#security-considerations)
- [Integration with Other ADRs](#integration-with-other-adrs)
- [Implementation Strategy](#implementation-strategy)

## Context

In a decentralized federation of Mnemosyne clusters, workers must have:

1. **Globally Unique Identities**: Verifiable across all federation clusters
2. **Cryptographic Authentication**: Secure, non-repudiable identity verification
3. **Competency Linkage**: Identity tied to demonstrated capabilities and performance
4. **Decentralized Control**: No single entity controls identity issuance or validation

This supports the [democratic AI access mission](ADR-008-cluster-delegate-election-model-specialization.md#core-mission-and-ethos) by enabling grassroots participation without requiring approval from centralized authorities.

## Decision

Implement **Decentralized Worker Identity** using Decentralized Identifiers (DIDs) with cryptographic authentication and competency map integration.

## Core Identity Framework

### Worker Identity Structure

```typescript
interface WorkerIdentity {
  did: string;                     // did:mnemosyne:worker:{hash}
  publicKey: string;               // Ed25519 public key for authentication
  attestations: Attestation[];     // Third-party verifications
  operatorClaims: OperatorClaim[]; // Self-declared capabilities
  revocationRegistry: string;      // For identity revocation if compromised
  competencyMapHash: string;       // Hash reference to current competency map
  createdAt: string;              // Identity creation timestamp
  lastUpdated: string;            // Last modification timestamp
}

interface Attestation {
  issuer: string;                  // DID of attestor
  subject: string;                 // DID of worker being attested
  claims: VerifiedClaim[];         // What capabilities/qualities are attested
  signature: string;               // Cryptographic proof
  validUntil: string;             // Expiration date
  competencyEndorsement?: CompetencyEndorsement; // Specific capability attestations
}

interface CompetencyEndorsement {
  endorsedCapabilities: string[];  // Specific capabilities being endorsed
  performanceEvidence: string[];   // References to work demonstrating capability
  contextualFactors: string[];     // Conditions under which capabilities observed
  endorsementStrength: number;     // 0.0-1.0 confidence in endorsement
}
```

### DID Method Specification

**DID Format**: `did:mnemosyne:worker:{hash}`

Where `{hash}` is derived from:
- Worker's Ed25519 public key
- Initial competency claims
- Genesis timestamp
- Optional operator-provided entropy

## Registration Process

### 1. Identity Generation
```typescript
interface IdentityGeneration {
  keyPairGeneration: {
    algorithm: 'Ed25519';           // Cryptographic algorithm
    entropy: CryptographicEntropy;  // High-quality randomness
    keyDerivation: KeyDerivation;   // Deterministic key derivation
  };
  
  didCreation: {
    methodName: 'mnemosyne';
    methodSpecificId: string;       // Hash of public key + metadata
    didDocument: DIDDocument;       // W3C DID specification compliance
  };
  
  initialClaims: {
    operatorClaims: OperatorClaim[]; // Self-declared capabilities
    competencyBaseline: CompetencyBaseline; // Initial capability assessment
    contactInformation: ContactInfo; // Communication endpoints (optional)
  };
}
```

### 2. Competency Map Creation
**Integration Point**: Links to [ADR-014: Cross-Cluster Competency and Reputation](ADR-014-cross-cluster-competency-reputation.md#competency-map-creation)

Initial competency assessment generates baseline capability map that becomes part of the worker's identity.

### 3. Attestation Collection
Workers obtain third-party attestations to build credibility:

```typescript
interface AttestationProcess {
  attestorSelection: {
    eligibleAttestors: EligibleAttestor[]; // Who can provide attestations
    reputationRequirements: ReputationThreshold; // Minimum attestor credibility
    diversityRequirements: DiversityRequirement; // Prevent single-source attestations
  };
  
  attestationTypes: {
    identityVerification: IdentityAttestation;     // Real-world identity confirmation
    capabilityEndorsement: CapabilityAttestation;  // Skill and competency validation
    performanceWitness: PerformanceAttestation;    // Work quality confirmation
    characterReference: CharacterAttestation;      // Trustworthiness assessment
  };
  
  attestationValidation: {
    cryptographicVerification: SignatureVerification; // Validate attestor signatures
    reputationCheck: ReputationValidation;            // Verify attestor standing
    conflictDetection: ConflictDetection;             // Identify contradictory claims
  };
}
```

### 4. Federation Submission
**Integration Point**: Links to [ADR-007: Decentralized Global Federation](ADR-007-decentralized-global-federation.md#worker-registration)

Request admission to federation with proof-of-legitimacy and competency evidence.

### 5. Consensus Verification
Federation nodes verify identity, assess competency claims, and vote on admission using consensus mechanism defined in [ADR-010: Blockchain-of-Blockchains Federation Events](ADR-010-blockchain-federation-events.md).

## Authentication Protocol

### Interaction Authentication

Every knowledge operation includes cryptographic proof:

```typescript
interface AuthenticatedOperation {
  operation: KnowledgeOperation;
  workerDid: string;               // Identity of acting worker
  timestamp: string;               // When operation occurred
  nonce: string;                   // Prevent replay attacks
  signature: string;               // Ed25519 signature over operation+timestamp+nonce
  provenance: OperationProvenance; // Audit trail information
}

interface OperationProvenance {
  sourceCluster: string;           // Originating Mnemosyne cluster
  operationId: string;             // Unique operation identifier
  parentOperations: string[];      // Dependency chain
  consensusProof?: string;         // If operation required federation consensus
  competencyContext: CompetencyContext; // Relevant competency information
}
```

### Signature Verification

```typescript
interface SignatureVerification {
  publicKeyRetrieval: {
    didResolution: DIDResolution;    // Resolve DID to get current public key
    keyRotationHandling: KeyRotation; // Handle key updates and revocation
    cacheStrategy: KeyCacheStrategy;  // Efficient key lookup
  };
  
  signatureValidation: {
    cryptographicVerification: Ed25519Verification; // Validate signature
    timestampVerification: TimestampValidation;     // Ensure operation freshness
    nonceValidation: NonceValidation;               // Prevent replay attacks
    operationIntegrity: IntegrityCheck;             // Ensure data not tampered
  };
  
  authorizationCheck: {
    capabilityCheck: CapabilityAuthorization;       // Worker authorized for operation
    roleValidation: RoleValidation;                 // Proper role for operation type
    contextValidation: ContextAuthorization;        // Operation appropriate for context
  };
}
```

## Competency Integration

### Linking Identity to Performance

**Integration Point**: Detailed in [ADR-014: Cross-Cluster Competency and Reputation](ADR-014-cross-cluster-competency-reputation.md)

Worker identity includes hash reference to current competency map, enabling:

- **Performance Tracking**: Link actions to identity for accountability
- **Capability Evolution**: Track skill development over time
- **Reputation Building**: Accumulate positive performance evidence
- **Trust Calibration**: Democratic validation of competency claims

### Cross-Cluster Recognition

```typescript
interface CrossClusterRecognition {
  competencyPortability: {
    mapSynchronization: CompetencyMapSync;    // Share competency updates across clusters
    reputationPropagation: ReputationSync;    // Propagate performance evidence
    skillRecognition: SkillRecognition;       // Acknowledge capabilities federation-wide
  };
  
  federationStanding: {
    globalReputation: GlobalReputationScore;  // Federation-wide reputation metrics
    crossClusterEndorsements: CrossEndorsements; // Multi-cluster validation
    specialtyRecognition: SpecialtyRecognition;  // Unique capabilities acknowledged
  };
}
```

## Security Considerations

### Identity Protection

- **Private Key Security**: Workers responsible for key protection and rotation
- **Revocation Mechanism**: Compromised identities can be revoked through consensus
- **Attestation Validation**: Cryptographic verification prevents false attestations
- **Replay Protection**: Nonces and timestamps prevent operation replay

### Privacy Considerations

- **Selective Disclosure**: Workers can choose which capabilities to reveal publicly
- **Pseudonymous Operation**: DIDs provide privacy while enabling accountability
- **Data Minimization**: Only necessary identity information included in operations

### Attack Resistance

**Integration Point**: Related to [ADR-013: Truth Verification and Trust System](ADR-013-truth-verification-trust.md#anti-misinformation-protections)

- **Sybil Resistance**: Attestation requirements and consensus make fake identities costly
- **Collusion Resistance**: Distributed verification prevents coordinated identity fraud
- **Capture Resistance**: No single entity controls identity validation process

## Integration with Other ADRs

### Core Dependencies

- **[ADR-006: Distributed Knowledge Network Architecture](ADR-006-distributed-knowledge-network-architecture.md)**: Provides foundation for distributed identity
- **[ADR-007: Decentralized Global Federation](ADR-007-decentralized-global-federation.md)**: Defines federation context for identity use
- **[ADR-010: Blockchain-of-Blockchains Federation Events](ADR-010-blockchain-federation-events.md)**: Records identity events immutably

### Governance Integration

- **[ADR-011: Cluster Governance and Role Framework](ADR-011-cluster-governance-roles.md)**: Identity enables role assignment and accountability
- **[ADR-012: Democratic Election and Assessment](ADR-012-democratic-election-assessment.md)**: Identity required for democratic participation
- **[ADR-013: Truth Verification and Trust System](ADR-013-truth-verification-trust.md)**: Identity enables trust quantification and verification

### Operational Integration

- **[ADR-014: Cross-Cluster Competency and Reputation](ADR-014-cross-cluster-competency-reputation.md)**: Identity linked to competency maps
- **[ADR-015: Intelligent Work Distribution](ADR-015-intelligent-work-distribution.md)**: Identity enables capability-based assignment
- **[ADR-016: Multi-Modal Coordination](ADR-016-multi-modal-coordination.md)**: Identity enables specialized role coordination

## Implementation Strategy

### Phase 1: Basic Identity Infrastructure (Month 1-2)
- Implement DID generation and resolution
- Create basic authentication protocol
- Establish cryptographic signature verification

### Phase 2: Attestation System (Month 3-4)
- Build attestation creation and validation
- Implement reputation-based attestor selection
- Create attestation marketplace and discovery

### Phase 3: Federation Integration (Month 5-6)
- Integrate with consensus mechanism from [ADR-010](ADR-010-blockchain-federation-events.md)
- Implement cross-cluster identity recognition
- Connect to competency system from [ADR-014](ADR-014-cross-cluster-competency-reputation.md)

### Phase 4: Advanced Features (Month 7-8)
- Implement privacy-preserving selective disclosure
- Add advanced key rotation and recovery
- Integrate with governance roles from [ADR-011](ADR-011-cluster-governance-roles.md)

## Open Questions

1. **Key Recovery**: How to handle lost private keys while maintaining decentralization?
2. **Identity Portability**: How to transfer identity between different implementation platforms?
3. **Privacy vs. Accountability**: How to balance pseudonymity with democratic accountability?
4. **Attestation Economics**: How to incentivize quality attestations while preventing fraud?

## References

- [W3C Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-core/)
- [Ed25519 Digital Signature Algorithm](https://tools.ietf.org/html/rfc8032)
- [ADR-007: Decentralized Global Federation](ADR-007-decentralized-global-federation.md) (source document)
- [ADR-014: Cross-Cluster Competency and Reputation](ADR-014-cross-cluster-competency-reputation.md) (competency integration)
