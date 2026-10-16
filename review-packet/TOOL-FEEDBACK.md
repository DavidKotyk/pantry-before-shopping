# Factual implementation feedback draft

These are observed engineering notes from AI-assisted development, not invented personal testimony. David should review them and provide any required personal Yes/No answers.

## MCP TypeScript SDK 1.32.1

Used the published JavaScript modules from the official SDK to register tools, validate schemas, expose stateless Streamable HTTP and run an independent SDK client integration test. Protocol 2025-11-25 negotiated successfully. Structured results let the web interface and other clients share the same domain behavior. No separate mocked tool endpoint was needed.

The SDK supplies protocol plumbing, but application developers still need to design confirmation semantics, persistence and Host/Origin protection. An assistant receiving a tool description is not cryptographic proof of a human approval: this local server relies on its client to ask the user. A public multi-user service would need an authentication and approval design beyond this prototype.

## Node.js / Express / Zod

The shared synchronous store prevents overlapping in-process requests from double-spending a stock revision. Changes are validated against a copy and written by temporary-file replacement. This is appropriate to a small single-process local prototype; it is not a database or multi-process concurrency solution. Zod rejects invalid tool arguments before domain execution.

## Playwright

Used installed Chrome to exercise actual UI and MCP calls, capture desktop/mobile screenshots and record the working flow. Tests use independent temporary state files rather than alter the interactive pantry. Playwright and Chrome are needed for these developer checks, not for the server's normal operation.

## Actual friction log

1. First desktop screenshot showed the disclosure badge overlapping introductory text. Replaced absolute placement with a grid and rechecked the rendered result. This is an app-layout issue, not an Amazon SDK problem.
2. A Host-rejection test using fetch did not send the intended custom Host header in this runtime and returned a protocol error instead. Replaced that probe with Node's HTTP request API to test the actual Host boundary. The corrected check passed. No SDK defect is claimed.
3. The initial browser script referenced the workspace's bundled Playwright path. Added a pinned development dependency and changed the script to resolve it locally.

## Personal answer still needed

Would you build with the tools again, and why? David must supply or approve this answer. No Alexa hardware, Amazon runtime service, onboarding account or live user trial was exercised, and no feedback about those experiences is claimed.
