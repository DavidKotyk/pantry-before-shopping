# Draft entry

## Pantry Before Shopping

Dinner starts with what is recorded—not what an assistant assumes is in the cupboard.

## Inspiration

Planning dinner and recording that dinner was cooked are different actions. An assistant should not subtract supplies just because someone asks what they could make. It should also share ingredients across the whole plan instead of promising the same tomato twice.

## What it does

Pantry Before Shopping is a local MCP server with a guided browser demonstration. Its four tools inspect recorded lots, preview dinners, confirm cooking and add supplies. A preview allocates lots across every selected dinner and totals missing portions. Date labels prioritize lots; they do not establish food safety. A plan with shopping gaps cannot be confirmed.

Confirmation consumes supplies and writes a receipt. A changed pantry revision invalidates earlier previews. Repeating confirmation cannot consume the same plan twice. State and receipts survive restarts.

## Technology and track

Intended primary track: Alexa+, self-hosted MCP route. The official MCP SDK implements Streamable HTTP and negotiates protocol 2025-11-25. The browser initializes MCP and calls the tools directly. It is a guided deterministic interface, not a live Alexa connection, voice recognizer or language-model conversation. Another compatible MCP client can use the server. Node.js, Express, Zod, HTML, CSS and JavaScript support the implementation. No paid API, runtime model, shopping order or cloud account is used.

## Validation and limits

Six automated domain/integration tests and nine browser checks passed. Tests include combined shortages, lot ordering, invalid inputs, stale previews, replay rejection, persistence and real SDK client calls. Browser checks exercise actual HTTP tools and a 390-pixel layout.

The initial pantry is synthetic. Four recipe templates use household-defined portion units. There is no nutrition analysis, automatic purchasing, cross-device synchronization, authentication for public hosting or measured household savings. This is a single-process local tool; compatible assistants must respect explicit user approval before calling mutation tools. AI assisted implementation, testing and these materials. No novelty or award probability is established.

## Human review before entering

Confirm event-specific eligibility and ownership; inspect the working build and demo; approve source/video publication and submission terms. Add the actual published URLs only after publication. No contest entry exists yet.
