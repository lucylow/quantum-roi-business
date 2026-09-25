import { seededRandom, mean, percentile } from './math';

export interface RandomVariable { id: string; mean: number; stdDev: number; min?: number; max?: number; }
export interface MonteCarloTrial { values: Record<string, number>; objective: number; value: number; violated: boolean; }
export interface MonteCarloSummary { trials: number; meanObjective: number; p10Objective: number; p90Objective: number; meanValue: number; p10Value: number; p90Value: number; violationRate: number; }

function gaussian(random: () => number): number {
  const u = Math.max(random(), 1e-12);
  const v = Math.max(random(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sample(variable: RandomVariable, random: () => number): number {
  const raw = variable.mean + variable.stdDev * gaussian(random);
  return Math.max(variable.min ?? Number.NEGATIVE_INFINITY, Math.min(variable.max ?? Number.POSITIVE_INFINITY, raw));
}

export function runMonteCarlo(
  variables: RandomVariable[],
  objective: (values: Record<string, number>) => number,
  businessValue: (values: Record<string, number>) => number,
  violation: (values: Record<string, number>) => boolean,
  trials = 1000,
  seed = 42
): MonteCarloSummary {
  const random = seededRandom(seed);
  const results: MonteCarloTrial[] = [];
  for (let trial = 0; trial < trials; trial += 1) {
    const values: Record<string, number> = {};
    variables.forEach((variable) => { values[variable.id] = sample(variable, random); });
    results.push({ values, objective: objective(values), value: businessValue(values), violated: violation(values) });
  }
  const objectives = results.map(r => r.objective);
  const values = results.map(r => r.value);
  return {
    trials,
    meanObjective: mean(objectives),
    p10Objective: percentile(objectives, 0.1),
    p90Objective: percentile(objectives, 0.9),
    meanValue: mean(values),
    p10Value: percentile(values, 0.1),
    p90Value: percentile(values, 0.9),
    violationRate: results.filter(r => r.violated).length / Math.max(1, results.length)
  };
}

export function compareDistributions(a: MonteCarloSummary, b: MonteCarloSummary): {
  objectiveDelta: number;
  valueDelta: number;
  violationDelta: number;
} {
  return {
    objectiveDelta: b.meanObjective - a.meanObjective,
    valueDelta: b.meanValue - a.meanValue,
    violationDelta: b.violationRate - a.violationRate
  };
}

export function riskBand(summary: MonteCarloSummary): 'stable' | 'watch' | 'volatile' {
  const spread = Math.abs(summary.p90Value - summary.p10Value);
  const scale = Math.max(1, Math.abs(summary.meanValue));
  if (spread / scale < 0.1 && summary.violationRate < 0.05) return 'stable';
  if (spread / scale < 0.3 && summary.violationRate < 0.15) return 'watch';
  return 'volatile';
}
