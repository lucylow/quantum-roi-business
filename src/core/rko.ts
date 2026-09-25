import type { SolverTrace } from '../domain';
import { clamp, seededRandom, shuffle } from './math';

export interface RKOConfig {
  dimensions: number;
  populationSize: number;
  iterations: number;
  seed: number;
  decoder: (keys: number[]) => number[];
  fitness: (decision: number[]) => number;
  maximize?: boolean;
}

export interface RKOResult {
  keys: number[];
  decision: number[];
  fitness: number;
  trace: SolverTrace[];
}

interface Candidate {
  keys: number[];
  decision: number[];
  fitness: number;
}

/**
 * Random-key optimizer inspired by the talk's problem-independent search idea.
 * The optimizer does not know the business semantics. The decoder and fitness
 * function carry problem-specific knowledge, making the search engine reusable
 * across routing, rostering, allocation, and packing-like problems.
 */
export function randomKeyOptimize(config: RKOConfig): RKOResult {
  const random = seededRandom(config.seed);
  const maximize = config.maximize ?? false;
  const population: Candidate[] = Array.from({ length: Math.max(4, config.populationSize) }, () => {
    const keys = Array.from({ length: config.dimensions }, () => random());
    const decision = config.decoder(keys);
    return { keys, decision, fitness: config.fitness(decision) };
  });

  const better = (a: Candidate, b: Candidate) => (maximize ? a.fitness > b.fitness : a.fitness < b.fitness);
  let best = population.reduce((winner, current) => (better(current, winner) ? current : winner));
  const trace: SolverTrace[] = [];

  for (let step = 0; step < config.iterations; step += 1) {
    population.sort((a, b) => (better(a, b) ? -1 : 1));
    const eliteCount = Math.max(2, Math.floor(population.length * 0.25));
    const elites = population.slice(0, eliteCount);
    const next: Candidate[] = elites.map((item) => ({ ...item, keys: [...item.keys], decision: [...item.decision] }));

    while (next.length < population.length) {
      const parent = elites[Math.floor(random() * elites.length)];
      const sibling = elites[Math.floor(random() * elites.length)];
      const keys = parent.keys.map((key, index) => {
        const blend = random() < 0.5 ? key : sibling.keys[index];
        const mutation = (random() - 0.5) * 0.35;
        return clamp(blend + mutation, 0, 1);
      });
      const decision = config.decoder(keys);
      next.push({ keys, decision, fitness: config.fitness(decision) });
    }

    population.splice(0, population.length, ...shuffle(next, random));
    const currentBest = population.reduce((winner, current) => (better(current, winner) ? current : winner));
    if (better(currentBest, best)) best = currentBest;

    trace.push({
      step,
      objective: currentBest.fitness,
      bestObjective: best.fitness,
      feasibility: 1,
      elapsedMs: step + 1
    });
  }

  return { keys: best.keys, decision: best.decision, fitness: best.fitness, trace };
}
