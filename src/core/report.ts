import type { OptimizationProblem, OptimizationResult, ExperimentRun } from '../domain';
import { estimateBusinessImpact } from './businessImpact';

export function buildExperimentReport(problem: OptimizationProblem, result: OptimizationResult): string {
  const impact = estimateBusinessImpact(problem, result);
  const lines = [
    '# Quantum ROI Experiment Brief',
    '',
    `Problem: ${problem.name}`,
    `Domain: ${problem.domain}`,
    `Run: ${result.runId}`,
    `Solver: ${result.solver}`,
    `Status: ${result.status}`,
    '',
    '## Objective',
    problem.objective,
    '',
    `Baseline objective: ${result.baselineObjective.toFixed(4)}`,
    `Observed objective: ${result.objective.toFixed(4)}`,
    '',
    '## Business translation',
    ...impact.map(item => `- ${item.title}: ${item.statement} Method: ${item.methodology}`),
    '',
    '## Quantum readiness',
    `Score: ${result.quantumReadiness.score}/100`,
    `Category: ${result.quantumReadiness.category}`,
    `Logical variables: ${result.quantumReadiness.qubitsEstimate}`,
    `Estimated embedding overhead: ${result.quantumReadiness.embeddingOverhead}x`,
    `Next step: ${result.quantumReadiness.recommendedNextStep}`,
    '',
    '## Constraint audit',
    result.violations.length ? result.violations.map(v => `- ${v}`).join('\n') : '- No modeled constraint violations.',
    '',
    '## Reproducibility',
    `Solver seed: stored by caller; optimization trace length: ${result.trace.length}.`,
    'Use the same scenario, solver version, seed, and constraints when comparing against another backend.',
    '',
    '## Interpretation note',
    'This brief is a proof-of-concept experiment record. It does not establish quantum advantage, production savings, or hardware performance without a controlled benchmark.'
  ];
  return lines.join('\n');
}

export function buildPortfolioReport(experiments: ExperimentRun[]): string {
  const lines = ['# Experiment Portfolio', '', `Experiments: ${experiments.length}`, ''];
  experiments.forEach((run, index) => {
    lines.push(`## ${index + 1}. ${run.scenarioName}`);
    lines.push(`- Domain: ${run.domain}`);
    lines.push(`- Solver: ${run.solver}`);
    lines.push(`- Run ID: ${run.id}`);
    lines.push(`- Quantum readiness: ${run.result.quantumReadiness.score}/100`);
    lines.push(`- Status: ${run.result.status}`);
    lines.push('');
  });
  return lines.join('\n');
}
