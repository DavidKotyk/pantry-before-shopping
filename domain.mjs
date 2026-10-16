import { randomUUID } from 'node:crypto';

export const recipes = [
  { id: 'rice-beans', name: 'Tomato rice & beans', ingredients: { rice: 1, beans: 1, tomato: 1 } },
  { id: 'tomato-pasta', name: 'Tomato pasta', ingredients: { pasta: 1, tomato: 2 } },
  { id: 'bean-toast', name: 'Beans on toast', ingredients: { beans: 1, bread: 1 } },
  { id: 'rice-vegetables', name: 'Vegetable rice', ingredients: { rice: 1, vegetables: 1 } }
];
export function insist(condition, message) { if (!condition) throw new Error(message); }
export function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}
export function initialState() {
  return { revision: 0, lots: [
    { id: 'demo-tomato', ingredient: 'tomato', portions: 3, useFirst: '2026-10-17', source: 'Synthetic example' },
    { id: 'demo-beans', ingredient: 'beans', portions: 2, useFirst: '2026-10-20', source: 'Synthetic example' },
    { id: 'demo-rice', ingredient: 'rice', portions: 2, useFirst: null, source: 'Synthetic example' },
    { id: 'demo-pasta', ingredient: 'pasta', portions: 1, useFirst: null, source: 'Synthetic example' }
  ], plans: [], receipts: [] };
}
export function inventory(state) {
  return { revision: state.revision, lots: structuredClone(state.lots), recipes,
    receipts: structuredClone(state.receipts), notice: 'Portions are recipe units you define. Date labels set priority only; verify food suitability yourself.' };
}
export function addStock(state, { ingredient, portions, useFirst = null, source = 'Entered by household' }) {
  insist(Object.hasOwn(recipes.reduce((a, r) => Object.assign(a, r.ingredients), {}), ingredient), 'Choose a supported ingredient.');
  insist(Number.isInteger(portions) && portions > 0 && portions <= 100, 'Portions must be a whole number from 1 to 100.');
  insist(useFirst === null || validDate(useFirst), 'Use-first date must be a real YYYY-MM-DD date.');
  insist(typeof source === 'string' && source.trim().length > 0 && source.length <= 120, 'Source must be 1–120 characters.');
  const lot = { id: randomUUID(), ingredient, portions, useFirst, source: source.trim() };
  state.lots.push(lot); state.revision++;
  return { lot, revision: state.revision };
}
export function planMeals(state, { mealIds, portions = 1 }) {
  insist(Array.isArray(mealIds) && mealIds.length > 0 && mealIds.length <= 7, 'Choose between 1 and 7 meals.');
  insist(Number.isInteger(portions) && portions >= 1 && portions <= 8, 'Servings must be a whole number from 1 to 8.');
  const stock = structuredClone(state.lots).sort((a,b) => (a.useFirst ?? '9999').localeCompare(b.useFirst ?? '9999') || a.id.localeCompare(b.id));
  const missing = {}, allocations = [], meals = [];
  for (const id of mealIds) {
    const recipe = recipes.find(r => r.id === id);
    insist(recipe, 'Unknown meal.');
    const meal = { id, name: recipe.name, portions, needs: [], position: meals.length + 1 };
    for (const [ingredient, perServing] of Object.entries(recipe.ingredients)) {
      const required = perServing * portions;
      let remaining = required;
      for (const lot of stock.filter(l => l.ingredient === ingredient && l.portions > 0)) {
        const count = Math.min(remaining, lot.portions);
        if (!count) break;
        allocations.push({ meal: meal.position, lotId: lot.id, ingredient, portions: count, useFirst: lot.useFirst, source: lot.source });
        lot.portions -= count; remaining -= count;
      }
      if (remaining) missing[ingredient] = (missing[ingredient] ?? 0) + remaining;
      meal.needs.push({ ingredient, required, fromPantry: required - remaining, missing: remaining });
    }
    meals.push(meal);
  }
  const plan = { id: randomUUID(), revision: state.revision, createdAt: new Date().toISOString(), meals, allocations, missing,
    ready: Object.keys(missing).length === 0, status: 'preview' };
  state.plans.push(plan);
  state.plans = state.plans.slice(-100);
  return structuredClone(plan);
}
export function confirmPlan(state, { planId }) {
  const plan = state.plans.find(p => p.id === planId);
  insist(plan, 'Plan was not found; create a fresh preview.');
  insist(plan.status === 'preview', 'This plan has already been confirmed.');
  insist(plan.revision === state.revision, 'Pantry changed; create a fresh preview before confirming.');
  insist(plan.ready, 'Shopping gaps remain; add supplies and create a fresh preview.');
  const usage = {};
  for (const a of plan.allocations) usage[a.lotId] = (usage[a.lotId] ?? 0) + a.portions;
  for (const [id, amount] of Object.entries(usage)) insist(state.lots.find(l => l.id === id)?.portions >= amount, 'Stock no longer covers this plan.');
  for (const lot of state.lots) lot.portions -= usage[lot.id] ?? 0;
  state.revision++; plan.status = 'confirmed';
  const receipt = { id: randomUUID(), planId, at: new Date().toISOString(), revision: state.revision,
    meals: plan.meals.map(m => ({ name: m.name, portions: m.portions })), consumed: structuredClone(plan.allocations) };
  state.receipts.push(receipt);
  return structuredClone(receipt);
}
