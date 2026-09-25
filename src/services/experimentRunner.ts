import type { ExperimentRun, OptimizationInput, OptimizationResult } from '../domain';
import { executeOptimization } from './optimizationService';
import { createOptimizationEnvelope } from '../core/optimizationEnvelope';
import { putStoredRun } from './offlineRunStore';
import { validateScenarioForProblem, scenarioIsUsable } from '../core/scenarioValidators';

export interface ExperimentExecution {
  ok: boolean;
  result: OptimizationResult | null;
  experiment: ExperimentRun | null;
  audit: ReturnType<typeof createOptimizationEnvelope>['audit'] | null;
  error: string | null;
}

export async function runExperiment(input: OptimizationInput): Promise<ExperimentExecution> {
  const scenarioIssues = validateScenarioForProblem(input.problem, input.scenarioData);
  if (!scenarioIsUsable(scenarioIssues)) {
    return {
      ok: false,
      result: null,
      experiment: null,
      audit: null,
      error: scenarioIssues.filter(issue => issue.severity === 'error').map(issue => `${issue.path}: ${issue.message}`).join(' '),
    };
  }

  const executed = await executeOptimization(input);
  if (!executed.result) {
    return { ok: false, result: null, experiment: null, audit: null, error: executed.error ?? 'Optimization failed.' };
  }

  const envelope = createOptimizationEnvelope(input, executed.result);
  const experiment: ExperimentRun = {
    id: envelope.result.runId,
    createdAt: envelope.createdAt,
    scenarioName: input.problem.name,
    domain: input.problem.domain,
    solver: envelope.result.solver,
    result: envelope.result,
  };
  putStoredRun(experiment);
  return { ok: true, result: envelope.result, experiment, audit: envelope.audit, error: null };
}
