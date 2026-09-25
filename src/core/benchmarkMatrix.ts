import type { OptimizationResult } from '../domain';

export interface BenchmarkCell {
  solver: string;
  seed: number;
  objective: number;
  baseline: number;
  relativeObjective: number;
  feasible: boolean;
  durationMs: number;
}

export interface BenchmarkMatrix {
  solvers: string[];
  seeds: number[];
  cells: BenchmarkCell[];
}

export function buildBenchmarkMatrix(results: Array<OptimizationResult & { seed?: number }>): BenchmarkMatrix {
  const solvers = [...new Set(results.map(r => r.solver))];
  const seeds = [...new Set(results.map(r => r.seed ?? 42))].sort((a, b) => a - b);
  const cells = results.map((r) => ({
    solver: r.solver,
    seed: r.seed ?? 42,
    objective: r.objective,
    baseline: r.baselineObjective,
    relativeObjective: r.baselineObjective === 0 ? 0 : (r.objective - r.baselineObjective) / Math.abs(r.baselineObjective),
    feasible: r.violations.length === 0,
    durationMs: r.durationMs
  }));
  return { solvers, seeds, cells };
}

export function bestCell(matrix: BenchmarkMatrix): BenchmarkCell | null {
  if (!matrix.cells.length) return null;
  return matrix.cells.reduce((best, cell) => cell.objective < best.objective ? cell : best, matrix.cells[0]);
}

export function stabilityBySolver(matrix: BenchmarkMatrix): Record<string, { mean: number; min: number; max: number; spread: number }> {
  const result: Record<string, { mean: number; min: number; max: number; spread: number }> = {};
  matrix.solvers.forEach((solver) => {
    const values = matrix.cells.filter(c => c.solver === solver).map(c => c.objective);
    if (!values.length) return;
    const sum = values.reduce((s, v) => s + v, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    result[solver] = { mean: sum / values.length, min, max, spread: max - min };
  });
  return result;
}

export function matrixCsv(matrix: BenchmarkMatrix): string {
  const header = ['solver', 'seed', 'objective', 'baseline', 'relativeObjective', 'feasible', 'durationMs'];
  const rows = matrix.cells.map(c => [c.solver, c.seed, c.objective, c.baseline, c.relativeObjective, c.feasible, c.durationMs]);
  return [header, ...rows].map(row => row.map(value => JSON.stringify(value)).join(',')).join('\n');
}
