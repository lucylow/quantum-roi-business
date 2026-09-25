import type { OptimizationInput, OptimizationProblem } from '../domain';
import { clampIterations, solverBudget } from '../core/solverSafety';

export interface ExperimentDraft {
  problemId: string;
  solver: OptimizationInput['solver'];
  seed: number;
  iterations: number;
}

const DEFAULT_SEED = 42;

export function createDraft(problem: OptimizationProblem): ExperimentDraft {
  return {
    problemId: problem.id,
    solver: 'rko',
    seed: DEFAULT_SEED,
    iterations: solverBudget('rko').iterations,
  };
}

export function normalizeDraft(draft: ExperimentDraft, problem: OptimizationProblem): ExperimentDraft {
  const solver = draft.solver;
  return {
    problemId: problem.id,
    solver,
    seed: Number.isInteger(draft.seed) && draft.seed >= 1 ? Math.min(2_000_000_000, draft.seed) : DEFAULT_SEED,
    iterations: clampIterations(draft.iterations, solver),
  };
}

export function isDraftForProblem(draft: ExperimentDraft, problem: OptimizationProblem): boolean {
  return draft.problemId === problem.id;
}
