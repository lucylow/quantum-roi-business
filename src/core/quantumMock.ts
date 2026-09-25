import type { Decision, QuboModel, SolverTrace } from '../domain';
import { seededRandom } from './math';
import { evaluateQubo } from './qubo';

export interface QuantumSample {
  bits: number[];
  energy: number;
  probability: number;
}

export interface QuantumMockResult {
  bestBits: number[];
  bestEnergy: number;
  samples: QuantumSample[];
  trace: SolverTrace[];
  histogram: Record<string, number>;
}

/**
 * A deterministic local sampler that mimics a measurement-oriented workflow.
 * It is intentionally named quantumMock: it is NOT a quantum computer.
 * It provides a UX and post-processing contract that a Braket worker can later satisfy.
 */
export function sampleQuboLocally(model: QuboModel, shots: number, seed: number): QuantumMockResult {
  const random = seededRandom(seed);
  const safeShots = Math.max(32, Math.min(shots, 5000));
  const raw: QuantumSample[] = [];
  let bestBits = Array(model.n).fill(0);
  let bestEnergy = Number.POSITIVE_INFINITY;
  const histogram: Record<string, number> = {};

  for (let shot = 0; shot < safeShots; shot += 1) {
    const bits = Array.from({ length: model.n }, () => random() > 0.5 ? 1 : 0);
    const energy = evaluateQubo(model, bits);
    const key = bits.join('');
    histogram[key] = (histogram[key] ?? 0) + 1;
    if (energy < bestEnergy) {
      bestEnergy = energy;
      bestBits = bits;
    }
    if (shot < 24) raw.push({ bits, energy, probability: 1 / safeShots });
  }

  const ranked = raw.sort((a, b) => a.energy - b.energy).slice(0, 12);
  const trace: SolverTrace[] = ranked.map((sample, i) => ({
    step: i,
    objective: sample.energy,
    bestObjective: ranked.slice(0, i + 1).reduce((m, x) => Math.min(m, x.energy), Number.POSITIVE_INFINITY),
    feasibility: 1,
    elapsedMs: i + 1
  }));

  return { bestBits, bestEnergy, samples: ranked, trace, histogram };
}

export function quantumDecisions(model: QuboModel, bits: number[]): Decision[] {
  return model.variableLabels.map((label, index) => ({
    id: label,
    label,
    selected: Boolean(bits[index]),
    score: bits[index] ? 1 : 0,
    metadata: { variable: index, state: bits[index] }
  }));
}
