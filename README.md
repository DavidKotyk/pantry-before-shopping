# Pantry Before Shopping

An MCP household pantry tool: allocate recorded supplies across dinners, explain exact shopping gaps, then update inventory only when cooking is explicitly confirmed. Persistent revisions reject stale previews and duplicate confirmations.

## Run

Node.js 20 or later and npm:

```sh
npm ci --ignore-scripts
npm test
npm start
```

Open http://127.0.0.1:4180. The Streamable HTTP MCP endpoint is http://127.0.0.1:4180/mcp. The official SDK negotiates protocol 2025-11-25 or later. Tools are `inspect_pantry`, `preview_meals`, `confirm_cooking`, and `add_pantry_stock`. Connect an MCP client that supports Streamable HTTP to that endpoint; no API key is needed. Ask the assistant to inspect supplies, preview meals, explain shortages, and seek your explicit confirmation before cooking or adding supplies.

The browser is a **guided deterministic demonstration**, not a live Alexa connection or language-model conversation. It initializes MCP and calls actual tools over HTTP; there is no separate mocked HTTP API. No Amazon account, cloud runtime or model is called. The project is intended for the Alexa+ hackathon's self-hosted MCP route; certification and acceptance are not claimed.

## Data and operation

Initial supplies are synthetic and labeled. Each recipe uses user-defined portion units, not nutritional serving sizes. User dates set planning priority, not food safety. Four demonstration recipes are supported. Plans support up to seven meals through MCP, two through the demo interface, and up to eight portions per meal. Missing supplies never silently become inventory. Confirmation consumes the complete plan; do not confirm until you mean to record all listed meals as cooked.

State is saved in `data/pantry.json` with temporary-file replacement. Back up that file while the server is stopped. `PANTRY_DATA` selects another state file; `PORT` changes the listening port. Run only one server process per state file. Data is local, unencrypted and not suitable for shared public deployment. The server binds to 127.0.0.1 and checks Host and Origin. Remote Alexa connectivity, authentication, speech recognition, automatic meal selection, nutrition and purchasing are not implemented.

## Verification

`npm test` exercises domain behavior and a real official-SDK client over Streamable HTTP, including initialization, schema failures, confirmation, replay and host/origin rejection. `scripts/browser-check.mjs` verifies the guided browser flow in an isolated state file. Install Google Chrome, then run `node scripts/browser-check.mjs`. Playwright is a pinned development dependency; the scripts launch Chrome with `channel: chrome`. Normal app operation does not need Playwright or Chrome specifically. Evidence is in `docs/`.

Implementation and entry materials use disclosed AI assistance. No measured household savings, novel algorithm, user study or likelihood of an award is asserted. Read PLAN.md for the contest gate and remaining work.
