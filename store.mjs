import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { initialState } from './domain.mjs';

export class Store {
  constructor(path) {
    this.path = path;
    this.state = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : initialState();
    if (!Number.isInteger(this.state.revision) || !Array.isArray(this.state.lots) || !Array.isArray(this.state.plans) || !Array.isArray(this.state.receipts)) throw new Error('Invalid pantry file; restore a valid backup.');
  }
  read(fn) { return fn(this.state); }
  change(fn, args) {
    const next = structuredClone(this.state);
    const result = fn(next, args);
    mkdirSync(dirname(this.path), { recursive: true, mode: 0o700 });
    writeFileSync(`${this.path}.tmp`, JSON.stringify(next, null, 2), { mode: 0o600 });
    renameSync(`${this.path}.tmp`, this.path);
    this.state = next;
    return result;
  }
}
