# Pantry Before Shopping

Status: implementation, not ready for submission. Created October 16, 2026.

## Opportunity and qualification

Amazon Build, Ship, Shape, Alexa+ track. Primary sources checked October 16:
- https://amazonappdev2026.devpost.com/rules
- https://amazonappdev2026.devpost.com/resources

Deadline October 23, 2026, noon PDT / 3 p.m. Eastern. Alexa+ cash awards are $25,000 / $15,000 / $4,000, plus separate AWS credits. No probability of winning is established. Awards depend on judging, eligibility verification and winner paperwork; cash is sent by mail or bank within the stated 60-day period after required forms. The permitted build is a working self-hosted MCP server, spec 2025-11-25 or later, using Streamable HTTP. A web simulation may demonstrate the experience. No Alexa device or paid API is required for this route. Public or judge-shared repository, a working video under three minutes, and factual tool feedback are required. Publication and entry remain for final approval. Prior adult/US answers exist; sponsor/conflict eligibility must be reconfirmed for this event. AI-assisted development will be disclosed; no personal learning claims will be invented.

## Problem

A voice assistant can invent what is in a kitchen or quietly consume stock while merely proposing dinner. Build a stateful pantry tool that separates recorded supplies, proposed meals, shopping gaps and confirmed cooking. User date labels prioritize planning; they do not determine food safety.

## Deliverable

An actual MCP server and a polished local guided assistant demo calling its tools over Streamable HTTP. The guided demo uses explicit intents and deterministic planning, not an LLM or actual Alexa integration. Any compatible MCP client can call the same tools. No claim of Alexa certification, deployment, novelty, savings or live user validation.

1. Durable lot inventory with integer portions, dates and source labels; synthetic example data clearly marked.
2. Multi-meal plan allocates a shared inventory without double counting, prioritizes dated stock, and computes exact missing ingredient portions.
3. Preview does not mutate stock. Confirm only a fully supplied, current plan. Revisions invalidate stale previews; repeated confirmations cannot consume twice. Auditable receipts survive restart.
4. MCP tools: inspect inventory, create plan, confirm plan, add stock. SDK-based protocol negotiation, Streamable HTTP and schema validation. Local binding and origin/host protections.
5. Web experience explains meal choices, stock allocations and gaps, provides explicit confirmation, shows tool trace and receipts, and supports adding stock and replanning.
6. Meaningful domain and actual SDK-client integration tests; mobile/browser verification; real local demo recording; review-packet/INDEX.md with all final human actions.

## Acceptance evidence

Tests must prove cumulative shortages, lot ordering, invalid input/date handling, no preview mutation, rejection of stale/partial plans, replay resistance, persistence and protocol initialization/tool calls over HTTP. Browser verification must exercise the same server state and confirmation path. Video must show working behavior, not mock responses. Final packet must distinguish tested behavior from planned behavior.

## Checkpoint

Selected this route after rejecting crowded/unclear small bounties. GitLab contributor page shows Login and Start onboarding; access is not verified. OpenCV requires meaningful AWS runtime and is deferred. Next: install pinned SDK dependencies, implement domain and transport, then test before recording.

October 16 implementation checkpoint: core, SDK HTTP tools and guided UI implemented. Six domain/integration tests and nine browser checks passed, including protocol 2025-11-25 negotiation and HTTP tool use. Local server running on port 4180. Continue from review-packet/INDEX.md; source/video remain unpublished.
