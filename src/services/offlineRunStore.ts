import type { ExperimentRun } from '../domain';

export interface StoredRunEnvelope {
  id: string;
  createdAt: string;
  run: ExperimentRun;
}

const MAX_ITEMS = 20;
let store: StoredRunEnvelope[] = [];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function listStoredRuns(): StoredRunEnvelope[] {
  return clone(store);
}

export function getStoredRun(id: string): StoredRunEnvelope | null {
  const item = store.find(entry => entry.id === id);
  return item ? clone(item) : null;
}

export function putStoredRun(run: ExperimentRun): StoredRunEnvelope {
  const now = new Date().toISOString();
  const envelope = { id: run.id, createdAt: now, run: clone(run) };
  store = [envelope, ...store.filter(item => item.id !== run.id)].slice(0, MAX_ITEMS);
  return clone(envelope);
}

export function removeStoredRun(id: string): boolean {
  const before = store.length;
  store = store.filter(item => item.id !== id);
  return store.length !== before;
}

export function clearStoredRuns(): void {
  store = [];
}

export function replaceStoredRuns(items: StoredRunEnvelope[]): void {
  store = items
    .filter(item => item && item.id && item.run?.id)
    .map(clone)
    .slice(0, MAX_ITEMS);
}

export function serializeStoredRuns(): string {
  return JSON.stringify(store);
}

export function restoreStoredRuns(raw: string): { restored: number; rejected: boolean } {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return { restored: 0, rejected: true };
    const valid = parsed.filter(item => {
      const candidate = item as StoredRunEnvelope;
      return Boolean(candidate?.id && candidate?.run?.id && candidate?.run?.result?.runId);
    });
    replaceStoredRuns(valid as StoredRunEnvelope[]);
    return { restored: store.length, rejected: false };
  } catch {
    return { restored: 0, rejected: true };
  }
}
