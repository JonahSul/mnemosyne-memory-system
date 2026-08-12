# @mnemosyne/streaming

Real SSE and WebSocket streaming for Mnemosyne.

## What this replaces

The legacy code had **fake SSE**: the Worker routed `/sse` to POST JSON-RPC
(no actual stream), and the Express server sent one connection message then
idled. This package implements **real streaming**.

## Components

- **`SSEEndpoint`** — real Server-Sent Events with heartbeat, event dispatch, and client lifecycle
- **`WebSocketEndpoint`** — WebSocket with Cloudflare Hibernation API support
- **`EventRouter`** — subscribes to `@mnemosyne/pubsub` domain events and pushes to connected clients

## Adapters

- **`CloudflareStreamingAdapter`** — uses Durable Object WebSocket Hibernation for cost-efficient persistent connections
- **`ExpressStreamingAdapter`** — Express + Socket.IO for local development

## Event flow

```
Domain event → @mnemosyne/pubsub EventBus → EventRouter → SSE/WS → client
```
