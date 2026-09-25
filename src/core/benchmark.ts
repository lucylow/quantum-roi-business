import type { OptimizationResult } from '../domain';
import { median } from './math';

export interface BenchmarkSummary {
  runs: number;
  bestObjective: number;
  medianObjective: number;
  medianDurationMs: number;
  feasibleRuns: number;
  objectiveSpread: number;
}

export function summarizeBenchmarks(results: OptimizationResult[]): BenchmarkSummary {
  if (!results.length) return { runs: 0, bestObjective: 0, medianObjective: 0, medianDurationMs: 0, feasibleRuns: 0, objectiveSpread: 0 };
  const objectives = results.map(r => r.objective);
  const durations = results.map(r => r.durationMs);
  const sorted = [...objectives].sort((a, b) => a - b);
  return {
    runs: results.length,
    bestObjective: Math.min(...objectives),
    medianObjective: median(objectives),
    medianDurationMs: median(durations),
    feasibleRuns: results.filter(r => !r.violations.length).length,
    objectiveSpread: Math.max(...sorted) - Math.min(...sorted)
  };
}

export function relativeChange(baseline: number, candidate: number): number {
  if (baseline === 0) return 0;
  return (candidate - baseline) / Math.abs(baseline);
}
