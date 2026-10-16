import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initialState, inventory, addStock, planMeals, confirmPlan, validDate } from '../domain.mjs';
import { Store } from '../store.mjs';

test('two meals share stock; preview never consumes and exact gaps accumulate', () => {
  const state=initialState(), before=structuredClone(state.lots);
  const p=planMeals(state,{mealIds:['rice-beans','tomato-pasta','rice-beans']});
  assert.deepEqual(p.missing,{tomato:1});
  assert.deepEqual(state.lots,before);
  assert.equal(p.allocations.filter(a=>a.ingredient==='tomato').reduce((n,a)=>n+a.portions,0),3);
  assert.throws(()=>confirmPlan(state,{planId:p.id}),/Shopping gaps/);
});
test('earlier dated lot wins over undated, independent of entry order',()=>{
  const state=initialState(); addStock(state,{ingredient:'rice',portions:1,useFirst:'2026-10-16'});
  const p=planMeals(state,{mealIds:['rice-beans']});
  assert.equal(p.allocations.find(a=>a.ingredient==='rice').useFirst,'2026-10-16');
});
test('confirmation persists a receipt and replay cannot consume twice',()=>{
  const file=join(mkdtempSync(join(tmpdir(),'pantry-test-')),'state.json');
  const store=new Store(file);
  const p=store.change(planMeals,{mealIds:['rice-beans']});
  const receipt=store.change(confirmPlan,{planId:p.id});
  const reopened=new Store(file);
  assert.equal(reopened.read(inventory).receipts[0].id,receipt.id);
  const before=readFileSync(file,'utf8');
  assert.throws(()=>reopened.change(confirmPlan,{planId:p.id}),/already/);
  assert.equal(readFileSync(file,'utf8'),before);
  assert.equal(reopened.state.lots.find(l=>l.ingredient==='rice').portions,1);
});
test('adding stock or confirming another plan invalidates older previews',()=>{
  const s=initialState(), p=planMeals(s,{mealIds:['rice-beans']});
  addStock(s,{ingredient:'bread',portions:1});
  assert.throws(()=>confirmPlan(s,{planId:p.id}),/changed/);
  const a=planMeals(s,{mealIds:['rice-beans']}),b=planMeals(s,{mealIds:['rice-beans']});
  confirmPlan(s,{planId:a.id});
  assert.throws(()=>confirmPlan(s,{planId:b.id}),/changed/);
});
test('invalid inputs fail without a partial store write',()=>{
  const store=new Store(join(mkdtempSync(join(tmpdir(),'pantry-invalid-')),'state.json'));
  const before=structuredClone(store.state);
  for (const input of [{ingredient:'rice',portions:-1},{ingredient:'rice',portions:1,useFirst:'2026-02-30'},{ingredient:'unknown',portions:1}]) assert.throws(()=>store.change(addStock,input));
  assert.throws(()=>store.change(planMeals,{mealIds:['rice-beans','unknown']}));
  assert.deepEqual(store.state,before);
  assert.equal(validDate('2026-02-30'),false);
  assert.equal(validDate('2028-02-29'),true);
});
