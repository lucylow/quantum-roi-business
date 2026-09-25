import type { OptimizationInput, SolverKind } from '../domain';
import { clampNumber, finiteNumber } from './safeNumber';

export interface SolverBudget {
  iterations: number;
  population: number;
  maxVariables: number;
  timeBudgetMs: number;
  shots: number;
}

export interface SolverSafetyIssue {
  id: string;
  severity: 'warning' | 'error';
  message: string;
}

const DEFAULT_BUDGET: SolverBudget = {
  iterations: 60,
  population: 32,
  maxVariables: 500,
  timeBudgetMs: 5_000,
  shots: 1_000,
};

const SOLVER_BUDGETS: Record<SolverKind, Partial<SolverBudget>> = {
  rko: { population: 32, timeBudgetMs: 4_000 },
  simulatedAnnealing: { timeBudgetMs: 4_000 },
  greedy: { iterations: 8, population: 8, timeBudgetMs: 1_000 },
  quantumMock: { iterations: 40, maxVariables: 80, timeBudgetMs: 2_500, shots: 1_000 },
  braket: { iterations: 20, maxVariables: 28, timeBudgetMs: 1_500, shots: 1_000 },
};

export function solverBudget(solver: SolverKind, input?: Partial<OptimizationInput>): SolverBudget {
  const overrideIterations = input?.iterations;
  const budget = { ...DEFAULT_BUDGET, ...SOLVER_BUDGETS[solver] };
  budget.iterations = Math.max(1, Math.min(500, Math.floor(finiteNumber(overrideIterations, budget.iterations))));
  budget.population = Math.max(4, Math.min(128, budget.population));
  budget.maxVariables = Math.max(4, Math.min(500, budget.maxVariables));
  budget.timeBudgetMs = Math.max(250, Math.min(30_000, budget.timeBudgetMs));
  budget.shots = Math.max(1, Math.min(1_000_000, budget.shots));
  return budget;
}

export function validateSolverRequest(input: OptimizationInput): SolverSafetyIssue[] {
  const issues: SolverSafetyIssue[] = [];
  const budget = solverBudget(input.solver, input);
  if (input.iterations !== budget.iterations) issues.push({ id: 'iterations-normalized', severity: 'warning', message: `Iteration budget will be normalized to ${budget.iterations}.` });
  if (input.problem.variables > budget.maxVariables) issues.push({ id: 'variable-cap', severity: 'error', message: `Problem size ${input.problem.variables} exceeds the ${budget.maxVariables}-variable solver budget.` });
  if (input.solver === 'braket' && input.problem.variables > 28) issues.push({ id: 'braket-size', severity: 'error', message: 'Live Braket requests must start from a reduced kernel of 28 variables or fewer.' });
  if (input.seed > 2_000_000_000) issues.push({ id: 'seed-range', severity: 'error', message: 'Seed exceeds the reproducible integer range.' });
  return issues;
}

export function clampIterations(value: number, solver: SolverKind): number {
  return clampNumber(Math.floor(value), 4, solverBudget(solver).iterations, solverBudget(solver).iterations);
}

export function estimateComputeRisk(input: OptimizationInput): number {
  const variableLoad = Math.min(1, Math.max(0, input.problem.variables / 500));
  const iterationLoad = Math.min(1, Math.max(0, input.iterations / 500));
  const solverMultiplier = input.solver === 'braket' ? 1.1 : input.solver === 'quantumMock' ? 0.7 : 0.5;
  return Math.min(1, variableLoad * 0.6 + iterationLoad * 0.3 + solverMultiplier * 0.1);
}

export function safetyMessage(issues: SolverSafetyIssue[]): string | null {
  const errors = issues.filter(issue => issue.severity === 'error');
  return errors.length ? errors.map(issue => issue.message).join(' ') : null;
}
