import type { OptimizationProblem, QuboModel, QuantumReadiness } from '../domain';
import { clamp, normalize } from './math';

export function estimateEmbeddingOverhead(qubo: QuboModel): number {
  const edges = Object.keys(qubo.quadratic).length;
  const density = qubo.n <= 1 ? 0 : edges / (qubo.n * (qubo.n - 1) / 2);
  return 1 + density * 4.5 + Math.max(0, qubo.n - 40) / 80;
}

export function assessQuantumReadiness(problem: OptimizationProblem, qubo: QuboModel): QuantumReadiness {
  const scaleFactor = normalize(qubo.n, 0, 100);
  const densityFactor = Object.keys(qubo.quadratic).length / Math.max(1, qubo.n * qubo.n);
  const constraintFactor = problem.constraints.filter((c) => c.enabled).length / Math.max(1, problem.constraints.length);
  const embeddingOverhead = estimateEmbeddingOverhead(qubo);

  // This score is a triage signal for experiments, not a claim of quantum advantage.
  let score = 100;
  score -= scaleFactor * 50;
  score -= clamp(densityFactor * 100, 0, 25);
  score -= clamp((embeddingOverhead - 1) * 12, 0, 25);
  score += constraintFactor * 8;
  score = clamp(score, 0, 100);

  const category: QuantumReadiness['category'] =
    score >= 72 ? 'strong candidate' : score >= 52 ? 'promising' : score >= 30 ? 'exploratory' : 'classical-first';

  const reasons: string[] = [];
  if (qubo.n <= 40) reasons.push('Logical variable count is small enough for an exploratory quantum prototype.');
  else reasons.push('Logical variable count is already large; reduction or decomposition matters.');
  if (densityFactor < 0.2) reasons.push('The interaction graph is relatively sparse, which may simplify mapping.');
  else reasons.push('Interaction density is high, increasing embedding and compilation pressure.');
  if (problem.domain === 'delivery' || problem.domain === 'robotics') reasons.push('The domain naturally maps to graph and routing formulations.');
  if (problem.domain === 'portfolio') reasons.push('Binary asset-selection decisions provide a direct QUBO representation.');
  if (problem.domain === 'workforce') reasons.push('Assignment constraints create a structured combinatorial search space.');

  return {
    score: Math.round(score),
    category,
    qubitsEstimate: qubo.n,
    embeddingOverhead: Number(embeddingOverhead.toFixed(2)),
    reasons,
    recommendedNextStep:
      category === 'strong candidate'
        ? 'Run classical baselines, then submit the reduced QUBO to a Braket simulator or QPU for benchmark comparison.'
        : category === 'promising'
          ? 'Reduce the graph/kernel and compare RKO or annealing against a quantum simulator.'
          : category === 'exploratory'
            ? 'Use the quantum formulation as a research experiment while keeping the classical solution in the production path.'
            : 'Keep the classical optimizer as the primary path and use quantum tooling only for research.'
  };
}
