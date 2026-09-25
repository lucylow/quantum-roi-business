import type { Metric, OptimizationResult, OptimizationProblem } from '../domain';
import { formatCurrency } from './math';

export interface ImpactEstimate {
  title: string;
  value: number;
  unit: string;
  statement: string;
  methodology: string;
}

export function estimateBusinessImpact(problem: OptimizationProblem, result: OptimizationResult): ImpactEstimate[] {
  const cost = result.metrics.find((m) => m.id === 'delivery-cost' || m.id === 'staff-cost');
  const minutes = result.metrics.find((m) => m.id === 'minutes-saved' || m.id === 'route-hours');
  const returnMetric = result.metrics.find((m) => m.id === 'return');
  const output: ImpactEstimate[] = [];

  if (cost && cost.baseline !== undefined) {
    const delta = Math.max(0, cost.baseline - cost.value);
    output.push({
      title: 'Direct operating-cost delta',
      value: delta,
      unit: 'USD',
      statement: `${formatCurrency(delta)} modeled cost avoided per scenario horizon.`,
      methodology: 'Baseline objective minus optimized operating-cost metric; does not assume scale beyond the supplied scenario.'
    });
  }
  if (minutes) {
    output.push({
      title: 'Capacity / time released',
      value: Math.max(0, minutes.value),
      unit: minutes.unit,
      statement: `${Math.round(Math.max(0, minutes.value))} ${minutes.unit} of modeled capacity protected.`,
      methodology: 'Derived from the domain metric, not from a generic conversion factor.'
    });
  }
  if (returnMetric) {
    output.push({
      title: 'Expected-return movement',
      value: returnMetric.value,
      unit: '%',
      statement: `${returnMetric.value.toFixed(1)}% modeled expected return under the selected asset set.`,
      methodology: 'Equal-weight demonstration portfolio; replace with client-approved allocation model before production use.'
    });
  }
  if (!output.length) {
    output.push({
      title: 'Objective movement',
      value: result.objective - result.baselineObjective,
      unit: 'score',
      statement: `${problem.direction === 'minimize' ? 'Lower' : 'Higher'} objective under the same scenario definition.`,
      methodology: 'Pure objective-function comparison; no financial translation is inferred.'
    });
  }
  return output;
}
