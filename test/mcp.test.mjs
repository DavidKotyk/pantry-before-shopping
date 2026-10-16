import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createApp } from '../server.mjs';

test('official client negotiates HTTP protocol and calls real durable tools',async()=>{
  const {app}=createApp({dataPath:join(mkdtempSync(join(tmpdir(),'pantry-mcp-')),'state.json')});
  const listener=app.listen(0,'127.0.0.1');
  await new Promise(r=>listener.once('listening',r));
  const url=`http://127.0.0.1:${listener.address().port}/mcp`;
  const client=new Client({name:'pantry-integration-test',version:'1.0.0'});
  const transport=new StreamableHTTPClientTransport(new URL(url));
  try {
    await client.connect(transport);
    assert.ok(transport.protocolVersion >= '2025-11-25');
    const tools=await client.listTools(); assert.equal(tools.tools.length,4);
    const get=()=>client.callTool({name:'inspect_pantry',arguments:{}});
    assert.equal((await get()).structuredContent.revision,0);
    const p=(await client.callTool({name:'preview_meals',arguments:{mealIds:['rice-beans']}})).structuredContent;
    assert.equal(p.ready,true);
    const receipt=await client.callTool({name:'confirm_cooking',arguments:{planId:p.id}});
    assert.ok(receipt.structuredContent.consumed.length);
    assert.equal((await get()).structuredContent.receipts.length,1);
    const replay=await client.callTool({name:'confirm_cooking',arguments:{planId:p.id}});
    assert.equal(replay.isError,true);
    const invalid=await client.callTool({name:'add_pantry_stock',arguments:{ingredient:'rice',portions:0}});
    assert.equal(invalid.isError,true);
    assert.equal((await get()).structuredContent.revision,1);
    const origin=await fetch(url,{method:'POST',headers:{origin:'https://external.example','content-type':'application/json'},body:'{}'});
    assert.equal(origin.status,403);
    const hostStatus=await new Promise((resolve,reject)=>{
      const req=request(url,{method:'POST',headers:{host:'external.example','content-type':'application/json'}},res=>{res.resume();resolve(res.statusCode);});
      req.on('error',reject);req.end('{}');
    });
    assert.equal(hostStatus,403);
  } finally { await client.close(); await new Promise(r=>listener.close(r)); }
});
