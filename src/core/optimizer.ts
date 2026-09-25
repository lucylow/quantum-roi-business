import type { OptimizationInput, OptimizationResult, SolverKind, QuboModel } from '../domain';
import { optimizeDelivery } from './delivery';
import { optimizeWorkforce } from './workforce';
import { optimizePortfolio } from './portfolio';
import { optimizeRobotics } from './robotics';
import { assessQuantumReadiness } from './readiness';
import { buildDomainQubo } from './quboDomain';
import { runHybridQuantumProof } from './hybridPipeline';
import { assertValidOptimizationInput } from './inputGuards';
import { stableRunId } from './stableRunId';

export function runLocalOptimization(input: OptimizationInput): OptimizationResult {
  assertValidOptimizationInput(input);
  if (input.solver === 'quantumMock' || input.solver === 'braket') {
    const proof = runHybridQuantumProof(input, 28);
    if (input.solver === 'braket') {
      return {
        ...proof.result,
        solver: 'braket',
        status: 'queued',
        notes: [...proof.result.notes, 'This local environment cannot submit a paid QPU task; the result models the server handoff contract.']
      };
    }
    return proof.result;
  }

  const started = Date.now();
  const { problem, scenarioData } = input;
  let solution;
  switch (problem.domain) {
    case 'delivery':
      solution = optimizeDelivery(problem, scenarioData as Parameters<typeof optimizeDelivery>[1], input.seed, input.iterations);
      break;
    case 'workforce':
      solution = optimizeWorkforce(problem, scenarioData as Parameters<typeof optimizeWorkforce>[1], input.seed, input.iterations);
      break;
    case 'portfolio':
      solution = optimizePortfolio(problem, scenarioData as Parameters<typeof optimizePortfolio>[1], input.seed, input.iterations);
      break;
    case 'robotics':
      solution = optimizeRobotics(problem, scenarioData as Parameters<typeof optimizeRobotics>[1], input.seed, input.iterations);
      break;
    default:
      throw new Error(`Domain ${problem.domain} is not yet supported by the local engine.`);
  }

  const qubo: QuboModel = buildDomainQubo(problem, scenarioData);
  const readiness = assessQuantumReadiness(problem, qubo);
  const notes = [
    'Local result is deterministic for a fixed seed.',
    'The classical solver remains the production benchmark.',
    `Quantum readiness is a triage score (${readiness.category}), not a claim of quantum advantage.`
  ];

  return {
    runId: stableRunId(input, 'run'),
    problemId: problem.id,
    solver: input.solver,
    status: 'complete',
    objective: solution.objective,
    baselineObjective: solution.baselineObjective,
    objectiveDirection: problem.direction,
    metrics: solution.metrics,
    decisions: solution.decisions,
    trace: solution.trace,
    violations: solution.violations,
    quantumReadiness: readiness,
    qaoaEligible: qubo.n <= 35,
    durationMs: Date.now() - started,
    notes
  };
}

export function compareSolvers(input: OptimizationInput): OptimizationResult[] {
  const solverKinds: SolverKind[] = ['greedy', 'rko', 'simulatedAnnealing', 'quantumMock'];
  return solverKinds.map((solver, index) => runLocalOptimization({ ...input, solver, seed: input.seed + index * 101 }));
}
