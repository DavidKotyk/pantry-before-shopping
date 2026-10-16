let rpcId=0, protocol='2025-11-25', currentPlan=null;
const $=s=>document.querySelector(s), trace=[];
function el(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
async function rpc(method,params={}){
  const response=await fetch('/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream','MCP-Protocol-Version':protocol},body:JSON.stringify({jsonrpc:'2.0',id:++rpcId,method,params})});
  if(!response.ok)throw new Error(`Connection failed (${response.status}).`);
  const body=await response.json();if(body.error)throw new Error(body.error.message);return body.result;
}
async function call(name,args={}){
  const result=await rpc('tools/call',{name,arguments:args});
  trace.unshift({tool:name,arguments:args,result:result.structuredContent??result.content});
  $('#trace').textContent=JSON.stringify(trace.slice(0,20),null,2);
  if(result.isError)throw new Error(result.content[0].text);
  return result.structuredContent;
}
async function refresh(){
  const data=await call('inspect_pantry');$('#revision').textContent=`REV ${data.revision}`;
  $('#lots').replaceChildren(...data.lots.filter(l=>l.portions>0).map(l=>{
    const row=el('div',undefined,'lot'),label=el('div');label.append(el('strong',l.ingredient),el('small',l.useFirst?`Use-first label: ${l.useFirst}`:'No date label'),el('small',l.source));
    const qty=el('div',l.portions,'quantity');qty.append(el('small','portions'));row.append(label,qty);return row;
  }));
  if(!$('#lots').children.length)$('#lots').append(el('p','No supplies recorded.'));
  $('#receipts').replaceChildren(...data.receipts.slice().reverse().map(r=>el('div',`${r.meals.map(m=>`${m.name} × ${m.portions}`).join(' · ')} — confirmed ${new Date(r.at).toLocaleString()}`, 'receipt')));
  if(!data.receipts.length)$('#receipts').append(el('p','Nothing consumed yet. Planning stays separate from cooking.','small'));
  if(currentPlan && currentPlan.revision!==data.revision){ const btn=$('#confirm');if(btn)btn.remove();$('#plan').append(el('p','Pantry changed. Preview again before confirming.','badge gap')); }
  return data;
}
function renderPlan(p){
  const box=$('#plan');box.replaceChildren(el('span',p.ready?'Covered by recorded supplies':'Shopping gaps to resolve',`badge ${p.ready?'':'gap'}`));
  for(const m of p.meals){const card=el('div',undefined,'meal');card.append(el('h3',`${m.position}. ${m.name}`));for(const n of m.needs)card.append(el('div',`${n.ingredient}: ${n.fromPantry}/${n.required} from pantry${n.missing?` · need ${n.missing}`:''}`,'need'));box.append(card);}
  if(!p.ready){const gap=el('div',undefined,'shopping');gap.append(el('strong','Shopping list'));for(const [name,count]of Object.entries(p.missing))gap.append(el('div',`${name} · ${count} portion${count===1?'':'s'}`));gap.append(el('p','Add supplies only when you have them, then preview again.','small'));box.append(gap);}
  else{const button=el('button','I’m cooking this — use these supplies','confirm');button.id='confirm';button.addEventListener('click',()=>run(async()=>{await call('confirm_cooking',{planId:p.id});currentPlan=null;box.replaceChildren(el('p','Cooking recorded. Your pantry and receipt are updated.','badge'));await refresh();}));box.append(button);}
  const allocation=el('details');allocation.append(el('summary','See where every portion comes from'));for(const a of p.allocations)allocation.append(el('p',`Dinner ${a.meal}: ${a.portions} ${a.ingredient} · ${a.useFirst??'undated'} · ${a.source}`,'small'));box.append(allocation);
}
async function run(fn){$('#message').textContent='';document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await fn();}catch(e){$('#message').textContent=e.message;}finally{document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
$('#planning').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);run(async()=>{currentPlan=await call('preview_meals',{mealIds:[f.get('meal1'),f.get('meal2')].filter(Boolean),portions:Number(f.get('portions'))});renderPlan(currentPlan);});});
$('#stock').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);run(async()=>{await call('add_pantry_stock',{ingredient:f.get('ingredient'),portions:Number(f.get('portions')),useFirst:f.get('date')||null});await refresh();$('#message').textContent='Supplies recorded. Preview again to use the updated pantry.';});});
await run(async()=>{const init=await rpc('initialize',{protocolVersion:protocol,capabilities:{},clientInfo:{name:'pantry-guided-demo',version:'0.1.0'}});protocol=init.protocolVersion;await fetch('/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream','MCP-Protocol-Version':protocol},body:JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})});const data=await refresh();for(const r of data.recipes){for(const id of ['#meal1','#meal2']){const option=el('option',r.name);option.value=r.id;$(id).append(option);}}$('#meal2').value='tomato-pasta';$('#connection').textContent=`● MCP ${protocol}`;});
