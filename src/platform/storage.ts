import type { ExperimentRun } from '../domain';

// Release-safe in-memory repository. It deliberately avoids adding a native
// persistence SDK until the app has a defined retention/deletion policy.
const MAX_EXPERIMENTS = 20;
let cache: ExperimentRun[] = [];

export function listExperiments(): ExperimentRun[] {
  return cache.slice();
}

export function saveExperiment(run: ExperimentRun): void {
  if (!run.id || !run.result?.runId) return;
  cache = [run, ...cache.filter(item => item.id !== run.id)].slice(0, MAX_EXPERIMENTS);
}

export function clearExperiments(): void {
  cache = [];
}
