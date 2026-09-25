import type { OptimizationInput, OptimizationProblem } from '../domain';

export interface GuardIssue {
  code: string;
  message: string;
}

const MAX_ITERATIONS = 500;
const MAX_VARIABLES = 500;
const MAX_CONSTRAINTS = 250;
const MAX_TAGS = 50;

export function validateOptimizationInput(input: unknown): GuardIssue[] {
  const issues: GuardIssue[] = [];
  if (!input || typeof input !== 'object') return [{ code: 'input', message: 'Optimization input must be an object.' }];
  const candidate = input as Partial<OptimizationInput>;
  if (!candidate.problem || typeof candidate.problem !== 'object') issues.push({ code: 'problem', message: 'Problem definition is required.' });
  if (!candidate.scenarioData || typeof candidate.scenarioData !== 'object') issues.push({ code: 'scenario', message: 'Scenario data is required.' });
  if (!Number.isInteger(candidate.seed) || Number(candidate.seed) < 1 || Number(candidate.seed) > 2_000_000_000) issues.push({ code: 'seed', message: 'Seed must be an integer from 1 to 2,000,000,000.' });
  if (!Number.isInteger(candidate.iterations) || Number(candidate.iterations) < 4 || Number(candidate.iterations) > MAX_ITERATIONS) issues.push({ code: 'iterations', message: `Iterations must be an integer from 4 to ${MAX_ITERATIONS}.` });
  if (candidate.problem && typeof candidate.problem === 'object') issues.push(...validateProblemShape(candidate.problem as OptimizationProblem));
  return issues;
}

export function validateProblemShape(problem: OptimizationProblem): GuardIssue[] {
  const issues: GuardIssue[] = [];
  if (!problem.id?.trim()) issues.push({ code: 'problem.id', message: 'Problem id is required.' });
  if (!problem.name?.trim()) issues.push({ code: 'problem.name', message: 'Problem name is required.' });
  if (!Number.isFinite(problem.scale) || problem.scale <= 0) issues.push({ code: 'problem.scale', message: 'Problem scale must be positive and finite.' });
  if (!Number.isInteger(problem.variables) || problem.variables < 1 || problem.variables > MAX_VARIABLES) issues.push({ code: 'problem.variables', message: `Variables must be an integer from 1 to ${MAX_VARIABLES}.` });
  if (!Array.isArray(problem.constraints) || problem.constraints.length > MAX_CONSTRAINTS) issues.push({ code: 'problem.constraints', message: `Constraints must be an array of at most ${MAX_CONSTRAINTS} items.` });
  if (!Array.isArray(problem.tags) || problem.tags.length > MAX_TAGS) issues.push({ code: 'problem.tags', message: `Tags must be an array of at most ${MAX_TAGS} items.` });
  return issues;
}

export function assertValidOptimizationInput(input: OptimizationInput): void {
  const issues = validateOptimizationInput(input);
  if (issues.length) throw new Error(issues.map(issue => issue.message).join(' '));
}
