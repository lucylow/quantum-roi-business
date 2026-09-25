import type { BusinessAssumption, OptimizationProblem } from '../domain';

export interface SensitivityPoint {
  id: string;
  label: string;
  baseline: number;
  low: number;
  high: number;
  unit: string;
}

export function buildSensitivity(problem: OptimizationProblem): SensitivityPoint[] {
  return problem.assumptions.map((assumption: BusinessAssumption) => ({
    id: assumption.id,
    label: assumption.label,
    baseline: assumption.value,
    low: assumption.value * 0.8,
    high: assumption.value * 1.2,
    unit: assumption.unit
  }));
}

export function scenarioNarrative(problem: OptimizationProblem, changes: Record<string, number>): string[] {
  return problem.assumptions.map((assumption) => {
    const next = changes[assumption.id] ?? assumption.value;
    const delta = assumption.value === 0 ? 0 : (next - assumption.value) / assumption.value;
    const pct = Math.round(delta * 100);
    if (!pct) return `${assumption.label}: unchanged at ${assumption.value}${assumption.unit}.`;
    return `${assumption.label}: ${pct > 0 ? '+' : ''}${pct}% from baseline (${next.toFixed(2)}${assumption.unit}).`;
  });
}
