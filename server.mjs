import express from 'express';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './mcp.mjs';
import { Store } from './store.mjs';

const root = dirname(fileURLToPath(import.meta.url));
export function createApp({ dataPath = resolve(root, 'data/pantry.json') } = {}) {
  const store = new Store(dataPath);
  const app = express();
  app.disable('x-powered-by');
  app.use((req,res,next) => {
    const host = req.hostname;
    if (!['127.0.0.1','localhost','[::1]','::1'].includes(host)) return res.status(403).json({ error: 'Local host required.' });
    if (req.headers.origin && ![`http://${req.headers.host}`].includes(req.headers.origin)) return res.status(403).json({ error: 'Cross-origin access denied.' });
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'");
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  app.post('/mcp', async (req,res) => {
    const server = createServer(store);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => { void transport.close(); void server.close(); });
    try { await server.connect(transport); await transport.handleRequest(req,res,req.body); }
    catch (e) { if (!res.headersSent) res.status(500).json({ error: 'MCP request failed.' }); }
  });
  app.all('/mcp', (req,res) => res.status(405).set('Allow','POST').end());
  app.get('/health', (req,res) => res.json({ ok: true, name: 'pantry-before-shopping' }));
  app.use(express.static(resolve(root,'web')));
  return { app, store };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4180);
  createApp({ dataPath: process.env.PANTRY_DATA || undefined }).app.listen(port,'127.0.0.1', () => console.log(`Pantry Before Shopping: http://127.0.0.1:${port} · MCP /mcp`));
}
