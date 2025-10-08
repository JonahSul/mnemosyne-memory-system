/**
 * Private RAG Interface for Federation Cluster Agents
 * Implements role-based access for ARBITER, ARCHIVIST, CURATOR, CUSTODIAN, AGENT operations
 */
import { z } from 'zod';
import { AgentRole, FederationSession } from './federation-auth.js';
export interface FederationRequest {
    agentId: string;
    sessionToken: string;
    operation: string;
    payload: Record<string, unknown>;
    timestamp: number;
}
export interface FederationResponse {
    success: boolean;
    data?: unknown;
    error?: string;
    agentId: string;
    operationId: string;
    timestamp: number;
}
/**
 * Federation RAG Operations Registry
 */
export declare const FEDERATION_OPERATIONS: {
    'arbiter:resolve-dispute': {
        role: AgentRole;
        capability: string;
        schema: z.ZodObject<{
            disputeId: z.ZodString;
            resolution: z.ZodEnum<["accept", "reject", "insufficient_evidence"]>;
            evidence: z.ZodArray<z.ZodString, "many">;
            reasoning: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            disputeId: string;
            resolution: "accept" | "reject" | "insufficient_evidence";
            evidence: string[];
            reasoning: string;
        }, {
            disputeId: string;
            resolution: "accept" | "reject" | "insufficient_evidence";
            evidence: string[];
            reasoning: string;
        }>;
        handler: (session: FederationSession, params: any) => Promise<{
            arbitrationId: string;
            status: string;
            decision: {
                disputeId: any;
                arbiter: string;
                resolution: any;
                evidence: any;
                reasoning: any;
                timestamp: string;
                clusterRole: string;
            };
        }>;
    };
    'archivist:bulk-ingest': {
        role: AgentRole;
        capability: string;
        schema: z.ZodObject<{
            source: z.ZodString;
            knowledgeItems: z.ZodArray<z.ZodObject<{
                content: z.ZodString;
                metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                importance: z.ZodNumber;
                tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                content: string;
                metadata: Record<string, unknown>;
                importance: number;
                tags?: string[] | undefined;
            }, {
                content: string;
                metadata: Record<string, unknown>;
                importance: number;
                tags?: string[] | undefined;
            }>, "many">;
            validationLevel: z.ZodEnum<["basic", "enhanced", "strict"]>;
        }, "strip", z.ZodTypeAny, {
            source: string;
            knowledgeItems: {
                content: string;
                metadata: Record<string, unknown>;
                importance: number;
                tags?: string[] | undefined;
            }[];
            validationLevel: "basic" | "enhanced" | "strict";
        }, {
            source: string;
            knowledgeItems: {
                content: string;
                metadata: Record<string, unknown>;
                importance: number;
                tags?: string[] | undefined;
            }[];
            validationLevel: "basic" | "enhanced" | "strict";
        }>;
        handler: (session: FederationSession, params: any) => Promise<{
            bulkIngestId: string;
            processed: number;
            successful: number;
            duplicates: number;
            errors: number;
            results: ({
                content: string;
                status: string;
                id: string;
                error?: never;
            } | {
                content: string;
                status: string;
                error: string;
                id?: never;
            })[];
        }>;
    };
    'curator:analyze-content': {
        role: AgentRole;
        capability: string;
        schema: z.ZodObject<{
            contentIds: z.ZodArray<z.ZodString, "many">;
            analysisType: z.ZodEnum<["metadata", "classification", "quality", "semantic"]>;
            enrichmentLevel: z.ZodEnum<["basic", "enhanced", "comprehensive"]>;
        }, "strip", z.ZodTypeAny, {
            contentIds: string[];
            analysisType: "metadata" | "classification" | "quality" | "semantic";
            enrichmentLevel: "basic" | "enhanced" | "comprehensive";
        }, {
            contentIds: string[];
            analysisType: "metadata" | "classification" | "quality" | "semantic";
            enrichmentLevel: "basic" | "enhanced" | "comprehensive";
        }>;
        handler: (session: FederationSession, params: any) => Promise<{
            analysisId: string;
            type: any;
            processed: number;
            successful: number;
            analyses: {
                contentId: any;
                status: string;
                curator: string;
                analysisType: any;
                metadata: {
                    wordCount: number;
                    language: string;
                    complexity: string;
                };
            }[];
        }>;
    };
    'custodian:threat-analysis': {
        role: AgentRole;
        capability: string;
        schema: z.ZodObject<{
            timeRange: z.ZodObject<{
                start: z.ZodString;
                end: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                start: string;
                end: string;
            }, {
                start: string;
                end: string;
            }>;
            analysisScope: z.ZodEnum<["memory_integrity", "access_patterns", "content_anomalies", "system_health"]>;
            severityThreshold: z.ZodEnum<["low", "medium", "high", "critical"]>;
        }, "strip", z.ZodTypeAny, {
            timeRange: {
                start: string;
                end: string;
            };
            analysisScope: "memory_integrity" | "access_patterns" | "content_anomalies" | "system_health";
            severityThreshold: "low" | "medium" | "high" | "critical";
        }, {
            timeRange: {
                start: string;
                end: string;
            };
            analysisScope: "memory_integrity" | "access_patterns" | "content_anomalies" | "system_health";
            severityThreshold: "low" | "medium" | "high" | "critical";
        }>;
        handler: (session: FederationSession, params: any) => Promise<{
            analysisId: string;
            custodian: string;
            scope: any;
            timeRange: any;
            threatsDetected: number;
            severityBreakdown: {
                critical: number;
                high: number;
                medium: number;
                low: number;
            };
            threats: {
                type: string;
                severity: string;
                description: string;
                evidence: Record<string, unknown>;
            }[];
        }>;
    };
};
/**
 * Process federation operation request
 */
export declare function processFederationOperation(operation: string, payload: Record<string, unknown>, sessionToken: string): Promise<FederationResponse>;
//# sourceMappingURL=federation-rag.d.ts.map