/**
 * Mnemosyne Durable Object — per-session stateful object.
 *
 * Delegates to application services. Does NOT contain business logic.
 * Phase 5 will implement the real DO with WebSocket Hibernation for streaming.
 */

export class MnemosyneDurableObject {
    constructor(private readonly state: DurableObjectState, private readonly env: unknown) { }

    async fetch(request: Request): Promise<Response> {
        // Phase 5: real implementation
        throw new Error('MnemosyneDurableObject.fetch: not yet implemented (Phase 5)');
    }

    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
        // Phase 6: real WebSocket Hibernation
        throw new Error('MnemosyneDurableObject.webSocketMessage: not yet implemented (Phase 6)');
    }
}
