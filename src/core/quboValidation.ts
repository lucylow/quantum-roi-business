import type { QuboModel } from '../domain';
import { finiteNumber } from './safeNumber';

export interface QuboValidationIssue {
  id: string;
  severity: 'error' | 'warning';
  message: string;
}

function add(issues: QuboValidationIssue[], id: string, message: string, severity: QuboValidationIssue['severity'] = 'error'): void {
  issues.push({ id, severity, message });
}

export function validateQuboDeep(model: QuboModel): QuboValidationIssue[] {
  const issues: QuboValidationIssue[] = [];
  if (!Number.isInteger(model.n) || model.n < 1 || model.n > 500) add(issues, 'n', 'QUBO n must be an integer from 1 to 500.');
  if (model.linear.length !== model.n) add(issues, 'linear', 'Linear coefficients must match n.');
  if (model.variableLabels.length !== model.n) add(issues, 'labels', 'Variable labels must match n.');
  if (!Number.isFinite(model.offset)) add(issues, 'offset', 'QUBO offset must be finite.');
  const seenLabels = new Set<string>();
  model.variableLabels.forEach((label, index) => {
    if (!label.trim()) add(issues, `label-${index}`, `Variable ${index} has an empty label.`);
    if (seenLabels.has(label)) add(issues, `label-duplicate-${index}`, `Variable label '${label}' is duplicated.`, 'warning');
    seenLabels.add(label);
  });
  model.linear.forEach((value, index) => {
    if (!Number.isFinite(value)) add(issues, `linear-${index}`, `Linear coefficient ${index} is not finite.`);
    if (Math.abs(finiteNumber(value)) > 1e12) add(issues, `linear-range-${index}`, `Linear coefficient ${index} is unusually large.`, 'warning');
  });
  Object.entries(model.quadratic).forEach(([key, value]) => {
    const [a, b] = key.split(',').map(Number);
    if (!Number.isInteger(a) || !Number.isInteger(b)) add(issues, `edge-format-${key}`, `Quadratic key '${key}' is malformed.`);
    else if (a < 0 || b < 0 || a >= model.n || b >= model.n) add(issues, `edge-range-${key}`, `Quadratic key '${key}' is outside the variable range.`);
    else if (a === b) add(issues, `edge-diagonal-${key}`, `Quadratic key '${key}' should not contain a diagonal interaction.`);
    if (!Number.isFinite(value)) add(issues, `edge-value-${key}`, `Quadratic coefficient '${key}' is not finite.`);
    if (Math.abs(finiteNumber(value)) > 1e12) add(issues, `edge-range-value-${key}`, `Quadratic coefficient '${key}' is unusually large.`, 'warning');
  });
  const density = model.n > 1 ? Object.keys(model.quadratic).length / (model.n * (model.n - 1) / 2) : 0;
  if (density > 0.9) add(issues, 'density', 'QUBO interaction density exceeds 90%; hardware embedding may be expensive.', 'warning');
  if (model.constraints.length > 250) add(issues, 'constraints', 'QUBO contains too many constraint descriptions.', 'warning');
  return issues;
}

export function quboIsValid(model: QuboModel): boolean {
  return !validateQuboDeep(model).some(issue => issue.severity === 'error');
}

export function quboDensity(model: QuboModel): number {
  const possible = model.n * Math.max(0, model.n - 1) / 2;
  return possible === 0 ? 0 : Object.keys(model.quadratic).length / possible;
}

export function canonicalQubo(model: QuboModel): QuboModel {
  const quadratic = Object.fromEntries(
    Object.entries(model.quadratic)
      .map(([key, value]) => {
        const [a, b] = key.split(',').map(Number);
        const normalized = a < b ? `${a},${b}` : `${b},${a}`;
        return [normalized, finiteNumber(value)] as [string, number];
      })
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  return {
    n: model.n,
    offset: finiteNumber(model.offset),
    linear: model.linear.map(value => finiteNumber(value)),
    quadratic,
    variableLabels: [...model.variableLabels],
    constraints: [...model.constraints],
  };
}

export function qpuReadinessWarnings(model: QuboModel): string[] {
  const warnings: string[] = [];
  const density = quboDensity(model);
  if (model.n > 35) warnings.push(`Model has ${model.n} logical variables; start with a reduced kernel.`);
  if (density > 0.5) warnings.push(`Interaction density is ${(density * 100).toFixed(1)}%; embedding may create substantial physical overhead.`);
  if (Object.keys(model.quadratic).length === 0) warnings.push('No quadratic couplings were detected; test whether a quantum formulation adds value over the classical objective.');
  return warnings;
}
