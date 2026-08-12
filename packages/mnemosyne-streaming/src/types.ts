export interface StreamClient {
    readonly id: string;
    readonly tenant: string;
    send(event: StreamEvent): void;
    close(): void;
}

export interface StreamEvent {
    readonly type: string;
    readonly data: unknown;
    readonly timestamp: number;
}
