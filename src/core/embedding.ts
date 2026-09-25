import type { QuboModel } from '../domain';
import { graphDensity } from './graph';

export interface EmbeddingEstimate {
  logicalQubits: number;
  interactionEdges: number;
  graphDensity: number;
  physicalQubits: number;
  chainLength: number;
  feasibility: 'low' | 'medium' | 'high';
  explanation: string[];
}

export function estimateEmbedding(model: QuboModel): EmbeddingEstimate {
  const n = model.n;
  const edges = Object.keys(model.quadratic).length;
  const density = n <= 1 ? 0 : edges / (n * (n - 1) / 2);
  const chainLength = Math.max(1, Math.ceil(1 + density * 8 + n / 60));
  const physicalQubits = Math.ceil(n * chainLength);
  const feasibility = physicalQubits <= 60 ? 'high' : physicalQubits <= 150 ? 'medium' : 'low';
  const explanation = [
    `Logical model: ${n} variables.`,
    `Interaction density: ${(density * 100).toFixed(1)}%.`,
    `Heuristic chain length: ${chainLength}.`,
    `Estimated physical footprint: ${physicalQubits}.`,
    'This is a planning heuristic, not an embedding solution from a target QPU.'
  ];
  void graphDensity;
  return { logicalQubits: n, interactionEdges: edges, graphDensity: density, physicalQubits, chainLength, feasibility, explanation };
}

export function embeddingWarnings(estimate: EmbeddingEstimate): string[] {
  const warnings: string[] = [];
  if (estimate.graphDensity > 0.5) warnings.push('Dense interaction graph may make minor embedding expensive.');
  if (estimate.chainLength > 6) warnings.push('Long logical chains may increase error exposure.');
  if (estimate.physicalQubits > 100) warnings.push('Estimated physical footprint exceeds a small exploratory budget.');
  return warnings;
}

export function isSmallEnoughForExploration(estimate: EmbeddingEstimate, budget = 100): boolean {
  return estimate.physicalQubits <= budget;
}
