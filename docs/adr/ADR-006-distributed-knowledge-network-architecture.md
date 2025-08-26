# ADR-006: Distributed Knowledge Network Architecture

**Status**: Proposed  
**Date**: 2025-08-24  
**Owners**: Memory Agent, Human Developer  
**Related ADRs**: [ADR-009](ADR-009-worker-identity-authentication.md), [ADR-010](ADR-010-blockchain-federation-events.md), [ADR-007](ADR-007-decentralized-global-federation.md)

## Overview

This ADR establishes the foundational distributed architecture for the Mnemosyne Memory System, introducing three core roles that enable secure, scalable knowledge management with authentication and access control.

## Context

The current Mnemosyne Memory System operates as a single-instance MCP server with no authentication mechanisms. This presents several architectural limitations:

1. **Security Risk**: The MCP server uses CORS wildcard (`*`) access and no authentication, making it "suicidally irresponsible" for private knowledge storage
2. **Scalability Constraints**: Single-instance architecture cannot support distributed knowledge networks
3. **Knowledge Governance**: No systematic approach to knowledge curation, quality assessment, or lifecycle management
4. **Access Control**: No distinction between public and private knowledge networks

Analysis of the current `src/agent.ts` reveals complete lack of authentication mechanisms and open CORS policies that would expose any private knowledge.

## Decision

Implement a **Distributed Knowledge Network Architecture** with five primary roles and comprehensive authentication foundation for the Mnemosyne federation.

## Core Architecture Roles

### Agent (System Participant)
- **Purpose**: Any participant operating within the system with baseline responsibilities
- **Key Responsibilities**: Adhere to fundamental system laws (don't harm, don't corrupt, don't impersonate), contribute constructively to shared knowledge, respect democratic governance decisions
- **Implementation**: Base role with cryptographic identity and behavioral monitoring
- **Security Integration**: Full integration with [ADR-009 Worker Identity and Authentication](ADR-009-worker-identity-authentication.md)

### Arbiter (Truth Decider and Tie-Breaker)
- **Purpose**: Highest-trust agent in each neighborhood, democratically elected by peers
- **Key Responsibilities**: Authoritative truth determination, dispute resolution, tie-breaking for contested memory claims, final arbitration of neighborhood governance matters
- **Implementation**: Elected role with enhanced privileges and accountability mechanisms
- **Democratic Process**: Term-limited elections with competency assessment and community oversight

### Archivist (Knowledge Flow Coordinator)
- **Purpose**: Central curator and coordinator for incoming knowledge flows
- **Key Responsibilities**: Knowledge submission processing, validation, routing, policy enforcement, traffic control for information flows
- **Implementation**: Distributed coordinator service with consensus mechanisms
- **Network Management**: Ensures smooth and secure information flow throughout the knowledge network

### Curator (Knowledge Enrichment and Classification)
- **Purpose**: Knowledge enrichment and classification system
- **Key Responsibilities**: Content analysis, metadata decoration, duplicate detection, categorization, quality enhancement
- **Implementation**: AI-powered classification with human-in-the-loop validation
- **Quality Assurance**: Ensures stored knowledge is well-organized, properly categorized, and easily discoverable

### Custodian (Security and Health Specialist)
- **Purpose**: Memory system security and health maintenance
- **Key Responsibilities**: Attack pattern detection, malactor identification and eviction, system health monitoring, defense-in-depth implementation
- **Implementation**: Proactive security monitoring with automated threat response
- **Threat Management**: Identifies and isolates threats including malicious actors and disoriented agents stuck in damaging loops, recruits Arbiters for falsehood determination

### Hermes (Inter-Cluster Messenger and Guardian)
- **Purpose**: Boundary-spanning representative for inter-cluster operations and cluster protection
- **Key Responsibilities**: Inter-cluster communication, knowledge transfer, cluster interest representation, boundary security, cultural preservation, representing best interests of every party to any transaction
- **Implementation**: Democratically elected role with continuous multi-source accountability
- **Democratic Process**: Elected by cluster participants based on verifiable competency evidence, replaceable when ineffective
- **Accountability Framework**: Continuous self-analysis and peer grading within cluster, plus external behavioral observations from federation operations
- **Dual Function**: Serves as both messenger (enabling inter-cluster cooperation) and guardian (protecting cluster integrity)
- **Principle**: "Doing the next right thing" through balanced representation of all transaction parties

### Authentication and Access Control Framework

## Authentication and Security Framework

This foundational architecture establishes secure, authenticated access for all network operations. **Detailed authentication specifications are covered in [ADR-009: Worker Identity and Authentication](ADR-009-worker-identity-authentication.md)**.

### Network Types

1. **Public Knowledge Networks**: Open access reading with authenticated contribution
2. **Private Knowledge Networks**: Full authentication for all operations with role-based access control

### Core Security Features

- **Cryptographic Identity**: Integration with DID-based worker authentication from [ADR-009](ADR-009-worker-identity-authentication.md)
- **Access Control**: Role-based permissions with fine-grained authorization
- **Network Isolation**: Strict boundaries between public and private networks
- **Audit Trails**: Complete provenance tracking for all knowledge operations

## Integration with Federation Architecture

This distributed architecture serves as the foundation for the broader Mnemosyne federation:

### Blockchain Integration
- **Event Recording**: All network operations recorded via [ADR-010: Blockchain-of-Blockchains Federation Events](ADR-010-blockchain-federation-events.md)
- **Consensus Mechanisms**: Distributed coordination uses blockchain consensus for critical decisions
- **Immutable Provenance**: Knowledge provenance secured through blockchain event logging

### Federation Scaling
- **Multi-Cluster Support**: Architecture designed to support federation expansion covered in [ADR-007: Decentralized Global Federation](ADR-007-decentralized-global-federation.md)
- **Cross-Network Sharing**: Framework for knowledge sharing across federation clusters
- **Democratic Governance**: Foundation supports democratic governance mechanisms from governance ADRs

## Implementation Strategy

### Phase 1: Authentication Foundation (Month 1-2)
- Implement authentication middleware for existing MCP server
- Replace CORS wildcard with configurable origin policies  
- Integrate with [ADR-009](ADR-009-worker-identity-authentication.md) DID authentication system

### Phase 2: Service Decomposition (Month 3-4)
- Extract Archivist capabilities from existing memory tools
- Implement distributed Arbiter coordination service
- Enhance Collection with access control and multi-tenancy

### Phase 3: Federation Integration (Month 5-6)
- Integrate with blockchain event system from [ADR-010](ADR-010-blockchain-federation-events.md)
- Enable cross-cluster knowledge sharing
- Connect to democratic governance framework

## Migration Path and Consequences

### Backward Compatibility
- Existing single-instance deployments operate as single-user private networks
- Current MCP tools enhanced with authentication but maintain API compatibility
- Gradual migration from centralized to distributed architecture

### Key Benefits
- **Security**: Eliminates current authentication vulnerabilities
- **Federation Foundation**: Enables scaling to full democratic federation
- **Governance Ready**: Supports systematic knowledge curation and quality control
- **Flexible Access**: Supports both public and private use cases

### Trade-offs
- **Complexity**: Increased architectural complexity requiring distributed system expertise
- **Performance**: Authentication and authorization overhead
- **Migration**: Complex transition from current single-instance architecture

## Related ADRs

- **[ADR-009: Worker Identity and Authentication](ADR-009-worker-identity-authentication.md)** - Detailed authentication and identity framework
- **[ADR-010: Blockchain-of-Blockchains Federation Events](ADR-010-blockchain-federation-events.md)** - Event recording and consensus mechanisms
- **[ADR-007: Decentralized Global Federation](ADR-007-decentralized-global-federation.md)** - Federation-wide scaling of this architecture

## Open Questions

1. **Identity Provider Integration**: Which identity providers to support beyond DID system?
2. **Network Discovery**: How do users discover and join public knowledge networks?
3. **Performance Optimization**: How to minimize authentication overhead for high-frequency operations?
4. **Migration Timeline**: Optimal timeline for transitioning existing users to authenticated architecture?
