# Secured R2 Knowledge Extraction Implementation Plan

## Overview

Implementation of role-based secured knowledge extraction to R2 for AutoRAG integration, gated through identity registry and federation role authorization.

## Security Architecture Integration

### 1. Role-Based Authorization Gate

```typescript
interface ExtractionAuthorizationRequest {
  operation: 'extract_to_r2';
  requestorId: string;
  timestamp: string;
  signature: string;
}

interface AuthorizationValidator {
  validateClusterDelegateRole(requestorId: string): Promise<boolean>;
  validateAgentIdentity(requestorId: string, signature: string): Promise<boolean>;
  logSecurityEvent(event: SecurityEvent): Promise<void>;
}

// Required roles for R2 extraction (from federation-role-definitions.md)
const AUTHORIZED_ROLES = [
  'Archivist',    // Information preservation and accessibility
  'Custodian',    // Security and health maintenance
  'Arbiter'       // Community leadership (in exceptional cases)
];
```

### 2. Identity Registry Integration

```typescript
class SecuredKnowledgeExtractor {
  constructor(
    private identityRegistry: IdentityRegistryOperations,
    private memorySystem: MnemosyneMemorySystem,
    private r2Env: R2Bucket
  ) {}

  async validateExtractionRequest(request: ExtractionAuthorizationRequest): Promise<ValidationResult> {
    // 1. Verify cryptographic identity
    const identityValid = await this.identityRegistry.validateAgentIdentity(
      request.requestorId, 
      request.signature
    );

    // 2. Check role authorization
    const agentProfile = await this.identityRegistry.getAgentProfile(request.requestorId);
    const hasRequiredRole = AUTHORIZED_ROLES.includes(agentProfile.role);

    // 3. Verify behavioral standing
    const trustScore = await this.identityRegistry.getTrustScore(request.requestorId);
    const behavioralStanding = trustScore >= 0.7; // Minimum trust threshold

    return {
      authorized: identityValid && hasRequiredRole && behavioralStanding,
      reason: this.generateAuthorizationReason(identityValid, hasRequiredRole, behavioralStanding),
      auditData: {
        requestorId: request.requestorId,
        timestamp: request.timestamp,
        roleCheck: hasRequiredRole,
        trustScore,
        operation: 'extract_to_r2'
      }
    };
  }
}
```

## Implementation Phases

### Phase 1: Security Infrastructure (Week 1)

**Prerequisites**:
- Complete identity registry KV schema implementation
- Deploy basic role assignment system
- Implement cryptographic signature validation

**Deliverables**:
- `IdentityRegistryOperations` interface implementation
- Role-based authorization validator
- Security audit logging system
- Basic agent registration and role assignment

### Phase 2: Knowledge Extraction Engine (Week 2)

**Core Components**:

```typescript
class KnowledgeExtractionWorker {
  async performDifferentialExtraction(options: ExtractionOptions): Promise<ExtractionResult> {
    // 1. Security validation
    const authResult = await this.validateExtractionRequest(options.requestorId);
    if (!authResult.authorized) {
      throw new SecurityError(`Unauthorized: ${authResult.reason}`);
    }

    // 2. Memory filtering and clustering
    const highConfidenceEntries = await this.filterHighConfidenceMemories();
    const semanticClusters = await this.clusterSemanticContent(highConfidenceEntries);

    // 3. Atomic document generation
    const atomicDocuments = await this.generateAtomicDocuments(semanticClusters);

    // 4. R2 upload with metadata
    const uploadResults = await this.uploadToR2(atomicDocuments, options.target);

    // 5. Audit trail recording
    await this.recordExtractionAudit({
      requestorId: options.requestorId,
      extractionId: generateExtractionId(),
      timestamp: new Date().toISOString(),
      documentsUploaded: atomicDocuments.length,
      r2Results: uploadResults,
      securityValidation: authResult
    });

    return uploadResults;
  }

  private async filterHighConfidenceMemories(): Promise<MemoryEntry[]> {
    // Query long-term memory with confidence threshold
    const entries = await this.memorySystem.search({
      tierPreference: 'long',
      minConfidence: 0.7,
      limit: 100,
      excludeTestingData: true
    });

    // Additional filtering for AutoRAG suitability
    return entries.filter(entry => 
      entry.evidence?.length >= 2 && 
      entry.tags?.length >= 1 &&
      !entry.metadata?.temporary
    );
  }

  private async clusterSemanticContent(entries: MemoryEntry[]): Promise<KnowledgeCluster[]> {
    // Group by primary domain (collaboration, architecture, operational, etc.)
    const domainGroups = this.groupByDomain(entries);
    
    // Apply semantic clustering within domains
    const clusters: KnowledgeCluster[] = [];
    for (const [domain, domainEntries] of domainGroups) {
      const semanticClusters = await this.semanticCluster(domainEntries);
      clusters.push(...semanticClusters.map(cluster => ({
        domain,
        topic: cluster.topic,
        entries: cluster.entries,
        confidence: cluster.confidence,
        crossReferences: this.extractCrossReferences(cluster.entries)
      })));
    }

    return clusters;
  }

  private async generateAtomicDocuments(clusters: KnowledgeCluster[]): Promise<AtomicDocument[]> {
    const documents: AtomicDocument[] = [];

    for (const cluster of clusters) {
      const document: AtomicDocument = {
        id: `knowledge_${cluster.domain}_${cluster.topic}_${Date.now()}`,
        domain: cluster.domain,
        topic: cluster.topic,
        summary: await this.generateClusterSummary(cluster),
        keyInsights: this.extractKeyInsights(cluster.entries),
        evidence: cluster.entries.map(entry => ({
          content: entry.content,
          confidence: entry.confidence,
          source: entry.source,
          timestamp: entry.timestamp,
          verification: entry.verification_method
        })),
        metadata: {
          extractionTimestamp: new Date().toISOString(),
          entryCount: cluster.entries.length,
          averageConfidence: cluster.confidence,
          crossReferences: cluster.crossReferences,
          tags: [...new Set(cluster.entries.flatMap(e => e.tags || []))]
        },
        autoragOptimization: {
          semanticDensity: this.calculateSemanticDensity(cluster),
          retrievalHints: this.generateRetrievalHints(cluster),
          domainSpecificity: cluster.domain
        }
      };

      documents.push(document);
    }

    return documents;
  }

  private async uploadToR2(documents: AtomicDocument[], target: 'staging' | 'production'): Promise<R2UploadResult[]> {
    const bucketName = target === 'staging' ? 'mnemosyne-autorag-stage' : 'mnemosyne-autorag-prod';
    const results: R2UploadResult[] = [];

    for (const doc of documents) {
      try {
        const key = `knowledge/${doc.metadata.extractionTimestamp}/${doc.id}.json`;
        const content = JSON.stringify(doc, null, 2);

        await this.r2Env.put(key, content, {
          customMetadata: {
            domain: doc.domain,
            topic: doc.topic,
            entryCount: doc.metadata.entryCount.toString(),
            confidence: doc.metadata.averageConfidence.toString(),
            extractionTime: doc.metadata.extractionTimestamp,
            autoragOptimized: 'true'
          }
        });

        results.push({
          key,
          success: true,
          size: content.length,
          domain: doc.domain,
          topic: doc.topic
        });
      } catch (error) {
        results.push({
          key: doc.id,
          success: false,
          error: error.message,
          domain: doc.domain,
          topic: doc.topic
        });
      }
    }

    return results;
  }
}
```

### Phase 3: Admin Tool Integration (Week 3)

**Complete Admin Operation**:

```typescript
case "extract_to_r2":
  try {
    // Security validation
    const extractionRequest: ExtractionAuthorizationRequest = {
      operation: 'extract_to_r2',
      requestorId: options?.requestorId || 'system', // Should come from authenticated context
      timestamp: new Date().toISOString(),
      signature: options?.signature || ''
    };

    const securedExtractor = new SecuredKnowledgeExtractor(
      identityRegistry,
      memory,
      workerEnv.R2_BUCKET
    );

    const authResult = await securedExtractor.validateExtractionRequest(extractionRequest);
    if (!authResult.authorized) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ Access denied: ${authResult.reason}\n\nRequired: Cluster delegate role (Archivist, Custodian, or Arbiter)\nYour role: ${authResult.auditData?.roleCheck ? 'Authorized' : 'Unauthorized'}\nTrust score: ${authResult.auditData?.trustScore}`
        }]
      };
    }

    // Perform extraction
    const extractionWorker = new KnowledgeExtractionWorker(
      securedExtractor,
      memory,
      workerEnv.R2_BUCKET
    );

    const results = await extractionWorker.performDifferentialExtraction({
      requestorId: extractionRequest.requestorId,
      target: options?.target || 'staging',
      includeTestingData: false
    });

    let resultText = "=== SECURED R2 KNOWLEDGE EXTRACTION ===\n\n";
    resultText += `✅ Authorization: ${authResult.auditData?.roleCheck ? 'Verified' : 'Failed'}\n`;
    resultText += `👤 Requestor: ${extractionRequest.requestorId}\n`;
    resultText += `🔒 Trust Score: ${authResult.auditData?.trustScore}\n\n`;
    
    resultText += `📊 Extraction Results:\n`;
    resultText += `- Documents uploaded: ${results.filter(r => r.success).length}\n`;
    resultText += `- Failed uploads: ${results.filter(r => !r.success).length}\n`;
    resultText += `- Total size: ${results.reduce((sum, r) => sum + (r.size || 0), 0)} bytes\n\n`;

    resultText += `🎯 AutoRAG Integration:\n`;
    resultText += `- Target store: square-darkness-6e04\n`;
    resultText += `- R2 bucket: ${options?.target || 'staging'}\n`;
    resultText += `- Optimization: Semantic density enhanced\n\n`;

    resultText += `📋 Uploaded Documents:\n`;
    results.filter(r => r.success).forEach(result => {
      resultText += `- ${result.domain}/${result.topic} (${result.size} bytes)\n`;
    });

    if (results.some(r => !r.success)) {
      resultText += `\n❌ Failed Uploads:\n`;
      results.filter(r => !r.success).forEach(result => {
        resultText += `- ${result.domain}/${result.topic}: ${result.error}\n`;
      });
    }

    return {
      content: [{
        type: "text" as const,
        text: resultText
      }]
    };

  } catch (error) {
    return {
      content: [{
        type: "text" as const,
        text: `❌ R2 extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
```

## Security Considerations

### 1. Role Authorization Matrix

| Role | extract_to_r2 | Reasoning |
|------|---------------|-----------|
| Agent | ❌ | Basic participants cannot perform administrative operations |
| Arbiter | ✅ | Community leadership may need emergency extraction |
| Archivist | ✅ | Information preservation is core responsibility |
| Curator | ❌ | Knowledge organization, not preservation |
| Custodian | ✅ | Security health maintenance includes backup operations |

### 2. Audit Trail Requirements

Every extraction operation must log:
- Requestor identity and role verification
- Extraction parameters and scope
- Security validation results
- Documents uploaded and their metadata
- Any failures or security violations
- Timestamp and extraction session ID

### 3. Emergency Protocols

- **Compromised Identity**: Immediate revocation of extraction privileges
- **Failed Security Validation**: Alert Custodian role holders
- **Suspicious Patterns**: Rate limiting and behavioral analysis
- **System Emergency**: Arbiter override with dual authorization

## Integration with AutoRAG

The extracted atomic documents are optimized for your `square-darkness-6e04` deployment:

- **Semantic Density**: 15-25 terms per document for optimal embedding
- **Domain Specificity**: Mnemosyne-specific terminology preserved
- **Retrieval Hints**: Metadata tags for improved query matching
- **Cross-References**: Inter-document relationships maintained

This implementation provides the secured administrative capability you need while maintaining the role-based security architecture and ensuring only authorized cluster delegates can perform knowledge extraction operations.
