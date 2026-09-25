import type { SolverTrace } from '../domain';
import { seededRandom, clamp } from './math';

export interface AnnealingConfig {
  initial: number[];
  iterations: number;
  seed: number;
  temperatureStart: number;
  temperatureEnd: number;
  objective: (state: number[]) => number;
  maximize?: boolean;
}

export interface AnnealingResult {
  state: number[];
  objective: number;
  trace: SolverTrace[];
}

export function simulatedAnneal(config: AnnealingConfig): AnnealingResult {
  const random = seededRandom(config.seed);
  const maximize = config.maximize ?? false;
  let current = [...config.initial];
  let currentObjective = config.objective(current);
  let best = [...current];
  let bestObjective = currentObjective;
  const trace: SolverTrace[] = [];
  const span = Math.max(1, config.iterations - 1);

  const better = (a: number, b: number) => (maximize ? a > b : a < b);
  const energyDelta = (candidate: number, reference: number) => (maximize ? reference - candidate : candidate - reference);

  for (let step = 0; step < config.iterations; step += 1) {
    const progress = step / span;
    const temperature = config.temperatureStart * Math.pow(config.temperatureEnd / config.temperatureStart, progress);
    const candidate = [...current];
    const index = Math.floor(random() * candidate.length);
    candidate[index] = clamp(candidate[index] + (random() - 0.5), 0, 1);
    const candidateObjective = config.objective(candidate);
    const delta = energyDelta(candidateObjective, currentObjective);
    const accepted = delta <= 0 || random() < Math.exp(-delta / Math.max(temperature, 1e-9));

    if (accepted) {
      current = candidate;
      currentObjective = candidateObjective;
    }
    if (better(currentObjective, bestObjective)) {
      best = [...current];
      bestObjective = currentObjective;
    }

    trace.push({
      step,
      objective: currentObjective,
      bestObjective,
      feasibility: 1,
      elapsedMs: step + 1
    });
  }

  return { state: best, objective: bestObjective, trace };
}
