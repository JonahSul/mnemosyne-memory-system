import {
	MIN_TOPICS_REQUIRED,
	TopicId,
	MemoryMetadataBase
} from './types.js';

export type MemoryValidationErrorCode =
	| 'MISSING_TOPICS'
	| 'INSUFFICIENT_TOPICS'
	| 'UNKNOWN_TOPIC'
	| 'MISSING_DOCUMENT_TYPE'
	| 'MISSING_AGENT_UUAD'
	| 'MISSING_TASK_CONTEXT';

export interface MemoryValidationError {
	ok: false;
	code: MemoryValidationErrorCode;
	message: string;
	details?: Record<string, unknown>;
}

export interface MemoryValidationSuccess {
	ok: true;
}

export type MemoryValidationResult = MemoryValidationSuccess | MemoryValidationError;

export const TOPIC_VOCABULARY: readonly TopicId[] = [
	'structure',
	'flow',
	'state',
	'transformation',
	'pattern',
	'abstraction',
	'identity',
	'relationship',
	'boundary',
	'composition',
	'time',
	'space',
	'scale',
	'constraint',
	'uncertainty',
	'control',
	'concurrency',
	'persistence',
	'communication',
	'semantics',
	'performance',
	'security',
	'observation',
	'intent',
	'agent'
] as const;

const TOPIC_SET = new Set<TopicId>(TOPIC_VOCABULARY);

export function validateMemoryMetadata(metadata: MemoryMetadataBase): MemoryValidationResult {
	if (!metadata?.topics || metadata.topics.length === 0) {
		return {
			ok: false,
			code: 'MISSING_TOPICS',
			message: 'Memory write requires at least one topic'
		};
	}

	if (metadata.topics.length < MIN_TOPICS_REQUIRED) {
		return {
			ok: false,
			code: 'INSUFFICIENT_TOPICS',
			message: `Memory write requires at least ${MIN_TOPICS_REQUIRED} topics`,
			details: { provided: metadata.topics.length, required: MIN_TOPICS_REQUIRED }
		};
	}

	const unknownTopics = metadata.topics.filter(topic => !TOPIC_SET.has(topic));
	if (unknownTopics.length > 0) {
		return {
			ok: false,
			code: 'UNKNOWN_TOPIC',
			message: 'Memory contains unknown topics',
			details: { unknownTopics }
		};
	}

	if (!metadata.documentType) {
		return {
			ok: false,
			code: 'MISSING_DOCUMENT_TYPE',
			message: 'documentType is required for memory writes'
		};
	}

	if (!metadata.agent?.uuad) {
		return {
			ok: false,
			code: 'MISSING_AGENT_UUAD',
			message: 'agent.uuad is required for memory writes'
		};
	}

	if (!metadata.task?.taskId || !metadata.task?.topics?.length) {
		return {
			ok: false,
			code: 'MISSING_TASK_CONTEXT',
			message: 'Task context with taskId and topics is required'
		};
	}

	return { ok: true };
}

export class MemoryValidationException extends Error {
	readonly code: MemoryValidationErrorCode;
	readonly details?: Record<string, unknown>;

	constructor(result: MemoryValidationError) {
		super(result.message);
		this.name = 'MemoryValidationException';
		this.code = result.code;
		this.details = result.details;
	}
}

export function assertValidMemoryMetadata(metadata?: MemoryMetadataBase | null): MemoryMetadataBase {
	const validation = metadata ? validateMemoryMetadata(metadata) : {
		ok: false as const,
		code: 'MISSING_TOPICS' as const,
		message: 'Memory write requires metadata with topics'
	};

	if (!validation.ok) {
		throw new MemoryValidationException(validation);
	}

	return metadata!;
}
