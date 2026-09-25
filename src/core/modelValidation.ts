import type { OptimizationProblem, OptimizationResult, QuboModel } from '../domain';

export interface ValidationIssue { id: string; severity: 'info' | 'warning' | 'error'; message: string; }

export function validateProblem(problem: OptimizationProblem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!problem.name.trim()) issues.push({ id: 'name', severity: 'error', message: 'Problem name is required.' });
  if (!problem.description.trim()) issues.push({ id: 'description', severity: 'warning', message: 'Add a business description for stakeholder context.' });
  if (problem.variables <= 0) issues.push({ id: 'variables', severity: 'error', message: 'Variable count must be positive.' });
  if (!problem.constraints.length) issues.push({ id: 'constraints', severity: 'warning', message: 'No constraints were supplied; results may not reflect the business rules.' });
  problem.constraints.forEach((c) => { if (c.penalty < 0) issues.push({ id: `constraint-${c.id}`, severity: 'error', message: `Penalty for ${c.label} cannot be negative.` }); });
  return issues;
}

export function validateQubo(model: QuboModel): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (model.n !== model.linear.length) issues.push({ id: 'linear-length', severity: 'error', message: 'QUBO linear coefficient length must equal n.' });
  if (model.variableLabels.length !== model.n) issues.push({ id: 'labels-length', severity: 'error', message: 'QUBO variable labels must equal n.' });
  Object.keys(model.quadratic).forEach((key) => {
    const [i, j] = key.split(',').map(Number);
    if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= model.n || j >= model.n || i === j) issues.push({ id: `edge-${key}`, severity: 'error', message: `Invalid quadratic key ${key}.` });
  });
  return issues;
}

export function validateResult(result: OptimizationResult): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!result.runId) issues.push({ id: 'run-id', severity: 'error', message: 'Run ID is missing.' });
  if (!Number.isFinite(result.objective)) issues.push({ id: 'objective', severity: 'error', message: 'Objective is not finite.' });
  if (!Number.isFinite(result.durationMs)) issues.push({ id: 'duration', severity: 'warning', message: 'Runtime was not recorded.' });
  if (result.trace.length === 0) issues.push({ id: 'trace', severity: 'warning', message: 'Solver trace is empty; convergence cannot be inspected.' });
  if (!result.quantumReadiness) issues.push({ id: 'readiness', severity: 'warning', message: 'Quantum-readiness metadata is missing.' });
  return issues;
}

export function validationSummary(issues: ValidationIssue[]): { errors: number; warnings: number; infos: number } {
  return {
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    infos: issues.filter(i => i.severity === 'info').length
  };
}

export function isValid(issues: ValidationIssue[]): boolean { return !issues.some(i => i.severity === 'error'); }
