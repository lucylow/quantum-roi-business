import type { OptimizationInput, OptimizationResult } from '../domain';
import type { AuditRecord } from '../core/audit';
import { canonicalQubo, quboDensity } from '../core/quboValidation';
import { stableHash } from '../utils';

export interface ExperimentReport {
  title: string;
  generatedAt: string;
  runId: string;
  business: {
    problem: string;
    domain: string;
    objective: string;
    direction: string;
  };
  outcome: {
    objective: number;
    baselineObjective: number;
    improvementPct: number;
    feasible: boolean;
    solver: string;
    status: string;
  };
  quantum: {
    readiness: string;
    logicalVariables: number;
    embeddingOverhead: number;
    qaoaEligible: boolean;
  };
  governance: {
    modelHash?: string;
    inputHash?: string;
    resultHash?: string;
    seed: number;
    iterations: number;
  };
  notes: string[];
}

function improvement(result: OptimizationResult): number {
  const denominator = Math.abs(result.baselineObjective);
  return denominator === 0 ? 0 : ((result.baselineObjective - result.objective) / denominator) * 100;
}

export function buildExperimentReport(input: OptimizationInput, result: OptimizationResult, audit?: AuditRecord | null, qubo?: ReturnType<typeof canonicalQubo>): ExperimentReport {
  const canonical = qubo ? canonicalQubo(qubo) : null;
  return {
    title: `${input.problem.name} experiment`,
    generatedAt: new Date().toISOString(),
    runId: result.runId,
    business: {
      problem: input.problem.name,
      domain: input.problem.domain,
      objective: input.problem.objective,
      direction: input.problem.direction,
    },
    outcome: {
      objective: result.objective,
      baselineObjective: result.baselineObjective,
      improvementPct: improvement(result),
      feasible: result.violations.length === 0,
      solver: result.solver,
      status: result.status,
    },
    quantum: {
      readiness: result.quantumReadiness.category,
      logicalVariables: canonical?.n ?? result.quantumReadiness.qubitsEstimate,
      embeddingOverhead: result.quantumReadiness.embeddingOverhead,
      qaoaEligible: result.qaoaEligible,
    },
    governance: {
      modelHash: audit?.modelHash,
      inputHash: audit?.inputHash,
      resultHash: audit?.resultHash,
      seed: input.seed,
      iterations: input.iterations,
    },
    notes: result.notes.slice(0, 20),
  };
}

export function reportAsJson(report: ExperimentReport): string {
  return JSON.stringify(report, null, 2);
}

export function reportAsMarkdown(report: ExperimentReport): string {
  const lines = [
    `# ${report.title}`,
    '',
    `Generated: ${report.generatedAt}`,
    `Run: ${report.runId}`,
    '',
    '## Business',
    `- Problem: ${report.business.problem}`,
    `- Domain: ${report.business.domain}`,
    `- Objective: ${report.business.objective}`,
    `- Direction: ${report.business.direction}`,
    '',
    '## Outcome',
    `- Solver: ${report.outcome.solver}`,
    `- Status: ${report.outcome.status}`,
    `- Objective: ${report.outcome.objective.toFixed(4)}`,
    `- Baseline: ${report.outcome.baselineObjective.toFixed(4)}`,
    `- Modeled improvement: ${report.outcome.improvementPct.toFixed(2)}%`,
    `- Feasible: ${report.outcome.feasible ? 'yes' : 'review required'}`,
    '',
    '## Quantum triage',
    `- Readiness: ${report.quantum.readiness}`,
    `- Logical variables: ${report.quantum.logicalVariables}`,
    `- Embedding overhead estimate: ${report.quantum.embeddingOverhead}x`,
    `- QAOA eligible by current heuristic: ${report.quantum.qaoaEligible ? 'yes' : 'no'}`,
    '',
    '## Governance',
    `- Seed: ${report.governance.seed}`,
    `- Iterations: ${report.governance.iterations}`,
    `- Model hash: ${report.governance.modelHash ?? 'not recorded'}`,
    `- Input hash: ${report.governance.inputHash ?? 'not recorded'}`,
    `- Result hash: ${report.governance.resultHash ?? 'not recorded'}`,
    '',
    '## Notes',
    ...report.notes.map(note => `- ${note}`),
  ];
  return lines.join('\n');
}

export function reportFingerprint(report: ExperimentReport): string {
  return stableHash(reportAsJson(report));
}

export function quboSummary(model: ReturnType<typeof canonicalQubo>): { variables: number; interactions: number; densityPct: number } {
  return { variables: model.n, interactions: Object.keys(model.quadratic).length, densityPct: Number((quboDensity(model) * 100).toFixed(2)) };
}
