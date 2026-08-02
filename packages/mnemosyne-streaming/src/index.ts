/**
 * @mnemosyne/streaming — real SSE and WebSocket streaming.
 *
 * Domain events from @mnemosyne/pubsub flow through the EventRouter to
 * connected SSE/WS clients. No fake SSE — real heartbeat, real dispatch.
 */

export { SSEEndpoint } from './sse-endpoint.js';
export { EventRouter } from './event-router.js';
export type { StreamClient, StreamEvent } from './types.js';
