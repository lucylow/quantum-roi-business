import { clamp } from './math';

export interface ScenarioDimension {
  id: string;
  label: string;
  unit: string;
  baseline: number;
  low: number;
  high: number;
  elasticity?: number;
}

export interface ScenarioPoint {
  id: string;
  values: Record<string, number>;
  objective: number;
  businessValue: number;
  risk: number;
}

export interface ScenarioModel {
  dimensions: ScenarioDimension[];
  objective: (values: Record<string, number>) => number;
  value: (values: Record<string, number>) => number;
  risk: (values: Record<string, number>) => number;
}

export function generateGrid(model: ScenarioModel, pointsPerDimension = 3): ScenarioPoint[] {
  const points: ScenarioPoint[] = [];
  const dimensions = model.dimensions;
  const values: Record<string, number> = {};

  const walk = (index: number) => {
    if (index === dimensions.length) {
      const id = dimensions.map((d) => `${d.id}:${values[d.id].toFixed(2)}`).join('|');
      points.push({ id, values: { ...values }, objective: model.objective(values), businessValue: model.value(values), risk: model.risk(values) });
      return;
    }
    const dimension = dimensions[index];
    for (let i = 0; i < pointsPerDimension; i += 1) {
      const ratio = i / Math.max(1, pointsPerDimension - 1);
      values[dimension.id] = dimension.low + (dimension.high - dimension.low) * ratio;
      walk(index + 1);
    }
  };
  walk(0);
  return points;
}

export function oneAtATime(model: ScenarioModel, steps = 7): ScenarioPoint[] {
  const result: ScenarioPoint[] = [];
  model.dimensions.forEach((dimension) => {
    for (let i = 0; i < steps; i += 1) {
      const ratio = i / Math.max(1, steps - 1);
      const values = Object.fromEntries(model.dimensions.map((d) => [d.id, d.baseline]));
      values[dimension.id] = dimension.low + (dimension.high - dimension.low) * ratio;
      result.push({
        id: `${dimension.id}-${i}`,
        values,
        objective: model.objective(values),
        businessValue: model.value(values),
        risk: model.risk(values)
      });
    }
  });
  return result;
}

export function elasticityScore(points: ScenarioPoint[], dimensionId: string): number {
  if (points.length < 2) return 0;
  const byId = points.filter((p) => dimensionId in p.values);
  const sorted = [...byId].sort((a, b) => a.values[dimensionId] - b.values[dimensionId]);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last || first.values[dimensionId] === last.values[dimensionId]) return 0;
  return (last.businessValue - first.businessValue) / (last.values[dimensionId] - first.values[dimensionId]);
}

export function robustPoint(points: ScenarioPoint[], riskBudget: number): ScenarioPoint | null {
  const eligible = points.filter((p) => p.risk <= riskBudget);
  if (!eligible.length) return null;
  return eligible.reduce((best, point) => point.businessValue > best.businessValue ? point : best, eligible[0]);
}

export function stressTest(model: ScenarioModel, shocks: Array<{ dimensionId: string; pct: number }>): ScenarioPoint {
  const values = Object.fromEntries(model.dimensions.map((d) => [d.id, d.baseline]));
  shocks.forEach((shock) => {
    if (values[shock.dimensionId] !== undefined) values[shock.dimensionId] *= 1 + clamp(shock.pct, -0.95, 3);
  });
  return {
    id: 'stress',
    values,
    objective: model.objective(values),
    businessValue: model.value(values),
    risk: model.risk(values)
  };
}

export function summarizeScenario(points: ScenarioPoint[]): {
  bestValue: number;
  worstValue: number;
  averageValue: number;
  p90Risk: number;
} {
  if (!points.length) return { bestValue: 0, worstValue: 0, averageValue: 0, p90Risk: 0 };
  const values = points.map((p) => p.businessValue).sort((a, b) => a - b);
  const risks = points.map((p) => p.risk).sort((a, b) => a - b);
  const index = Math.floor(0.9 * (risks.length - 1));
  return {
    bestValue: Math.max(...values),
    worstValue: Math.min(...values),
    averageValue: values.reduce((s, v) => s + v, 0) / values.length,
    p90Risk: risks[index]
  };
}
