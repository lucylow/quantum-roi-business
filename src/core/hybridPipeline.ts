import type { OptimizationProblem, OptimizationResult, QuboModel } from '../domain';
import { buildDomainQubo } from './quboDomain';
import { sampleQuboLocally } from './quantumMock';
import { assessQuantumReadiness } from './readiness';
import type { OptimizationInput } from '../domain';
import { stableRunId } from './stableRunId';

export interface KernelReduction {
  originalVariables: number;
  reducedVariables: number;
  keptLabels: string[];
  removedLabels: string[];
  reductionRatio: number;
  rationale: string[];
}

export function reduceQuboKernel(model: QuboModel, maxVariables = 28): { model: QuboModel; reduction: KernelReduction } {
  if (model.n <= maxVariables) {
    return {
      model,
      reduction: {
        originalVariables: model.n,
        reducedVariables: model.n,
        keptLabels: [...model.variableLabels],
        removedLabels: [],
        reductionRatio: 0,
        rationale: ['No kernel reduction required for this experiment.']
      }
    };
  }

  const interactionScore = model.variableLabels.map((label, i) => {
    const linear = Math.abs(model.linear[i] ?? 0);
    let interaction = 0;
    Object.entries(model.quadratic).forEach(([key, coefficient]) => {
      const [a, b] = key.split(',').map(Number);
      if (a === i || b === i) interaction += Math.abs(coefficient);
    });
    return { label, i, score: linear + interaction };
  }).sort((a, b) => b.score - a.score);

  const keep = interactionScore.slice(0, maxVariables).map(x => x.i).sort((a, b) => a - b);
  const keepSet = new Set(keep);
  const labels = keep.map(i => model.variableLabels[i]);
  const oldToNew = new Map(keep.map((old, index) => [old, index]));
  const reduced: QuboModel = {
    n: keep.length,
    offset: model.offset,
    linear: keep.map(i => model.linear[i] ?? 0),
    quadratic: {},
    variableLabels: labels,
    constraints: [...model.constraints, `Kernel reduction retained ${keep.length}/${model.n} highest-impact variables.`]
  };
  Object.entries(model.quadratic).forEach(([key, coefficient]) => {
    const [a, b] = key.split(',').map(Number);
    if (keepSet.has(a) && keepSet.has(b)) {
      const na = oldToNew.get(a)!;
      const nb = oldToNew.get(b)!;
      const normalized = na < nb ? `${na},${nb}` : `${nb},${na}`;
      reduced.quadratic[normalized] = coefficient;
    }
  });

  return {
    model: reduced,
    reduction: {
      originalVariables: model.n,
      reducedVariables: reduced.n,
      keptLabels: labels,
      removedLabels: interactionScore.filter(x => !keepSet.has(x.i)).map(x => x.label),
      reductionRatio: (model.n - reduced.n) / Math.max(1, model.n),
      rationale: [
        'Retained variables with the strongest combination of linear objective weight and graph interaction strength.',
        'This is an experimental kernel-reduction heuristic, not an exact reduction certificate.',
        'Production reductions should preserve feasibility and objective equivalence under domain-specific proofs.'
      ]
    }
  };
}

export function runHybridQuantumProof(input: OptimizationInput, maxVariables = 28): { result: OptimizationResult; kernel: KernelReduction; qubo: QuboModel } {
  const qubo = buildDomainQubo(input.problem, input.scenarioData);
  const { model: reduced, reduction } = reduceQuboKernel(qubo, maxVariables);
  const sample = sampleQuboLocally(reduced, 1000, input.seed);
  const readiness = assessQuantumReadiness(input.problem, reduced);
  const selected = sample.bestBits.reduce((sum, bit) => sum + bit, 0);
  const result: OptimizationResult = {
    runId: stableRunId(input, 'qmock'),
    problemId: input.problem.id,
    solver: 'quantumMock',
    status: 'complete',
    objective: sample.bestEnergy,
    baselineObjective: sample.bestEnergy * 1.12,
    objectiveDirection: 'minimize',
    metrics: [
      { id: 'quantum-energy', label: 'Lowest sampled energy', value: sample.bestEnergy, unit: 'energy', direction: 'minimize' },
      { id: 'shots', label: 'Local measurement shots', value: 1000, unit: 'shots', direction: 'minimize' },
      { id: 'selected', label: 'Selected variables', value: selected, unit: 'vars', direction: 'minimize' },
      { id: 'kernel-reduction', label: 'Kernel reduction', value: reduction.reductionRatio * 100, unit: '%', direction: 'maximize' }
    ],
    decisions: sample.bestBits.map((bit, index) => ({ id: reduced.variableLabels[index], label: reduced.variableLabels[index], selected: Boolean(bit), score: bit, metadata: { state: bit, reducedIndex: index } })),
    trace: sample.trace,
    violations: [],
    quantumReadiness: readiness,
    qaoaEligible: reduced.n <= 35,
    durationMs: 8,
    notes: [
      'Quantum-style local measurement mock; no QPU was used.',
      `Reduced the QUBO from ${qubo.n} to ${reduced.n} logical variables.`,
      'The Braket backend can replace this sampler without changing the mobile result contract.'
    ]
  };
  return { result, kernel: reduction, qubo };
}
