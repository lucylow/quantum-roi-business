export type BinaryVector = number[];

export interface ConstraintEvaluation {
  id: string;
  label: string;
  satisfied: boolean;
  violation: number;
  penalty: number;
  explanation: string;
}

export type ConstraintFn = (state: BinaryVector) => number;

export function equalityConstraint(id: string, label: string, indices: number[], target: number, penalty: number): ConstraintFn {
  return (state) => {
    const count = indices.reduce((sum, index) => sum + (state[index] ?? 0), 0);
    return Math.abs(count - target) * penalty;
  };
}

export function atMostConstraint(id: string, label: string, indices: number[], target: number, penalty: number): ConstraintFn {
  void id;
  void label;
  return (state) => {
    const count = indices.reduce((sum, index) => sum + (state[index] ?? 0), 0);
    return Math.max(0, count - target) * penalty;
  };
}

export function minimumConstraint(id: string, label: string, indices: number[], target: number, penalty: number): ConstraintFn {
  void id;
  void label;
  return (state) => Math.max(0, target - indices.reduce((sum, index) => sum + (state[index] ?? 0), 0)) * penalty;
}

export function evaluateConstraints(
  state: BinaryVector,
  specs: Array<{ id: string; label: string; type: 'hard' | 'soft'; penalty: number; evaluate: ConstraintFn; explanation: string }>
): ConstraintEvaluation[] {
  return specs.map((spec) => {
    const rawViolation = spec.evaluate(state);
    return {
      id: spec.id,
      label: spec.label,
      satisfied: rawViolation <= 1e-9,
      violation: rawViolation,
      penalty: spec.penalty,
      explanation: spec.explanation
    };
  });
}

export function totalPenalty(evaluations: ConstraintEvaluation[]): number {
  return evaluations.reduce((sum, item) => sum + item.violation, 0);
}

export function hardConstraintFailures(evaluations: ConstraintEvaluation[]): ConstraintEvaluation[] {
  return evaluations.filter((e) => !e.satisfied && e.penalty >= 50);
}

export function feasibilityScore(evaluations: ConstraintEvaluation[]): number {
  if (!evaluations.length) return 1;
  const normalized = evaluations.reduce((sum, e) => sum + (e.satisfied ? 1 : 0), 0) / evaluations.length;
  return Math.max(0, Math.min(1, normalized));
}

export class ConstraintRegistry {
  private specs: Array<{ id: string; label: string; type: 'hard' | 'soft'; penalty: number; evaluate: ConstraintFn; explanation: string }> = [];

  add(spec: { id: string; label: string; type: 'hard' | 'soft'; penalty: number; evaluate: ConstraintFn; explanation: string }): this {
    this.specs.push(spec);
    return this;
  }

  clear(): this {
    this.specs = [];
    return this;
  }

  list() {
    return [...this.specs];
  }

  evaluate(state: BinaryVector): ConstraintEvaluation[] {
    return evaluateConstraints(state, this.specs);
  }

  penalty(state: BinaryVector): number {
    return totalPenalty(this.evaluate(state));
  }

  score(state: BinaryVector): number {
    return feasibilityScore(this.evaluate(state));
  }

  explain(state: BinaryVector): string[] {
    return this.evaluate(state).filter((e) => !e.satisfied).map((e) => `${e.label}: ${e.explanation}`);
  }
}

export function buildAssignmentRegistry(groups: Array<{ id: string; target: number; indices: number[] }>): ConstraintRegistry {
  const registry = new ConstraintRegistry();
  groups.forEach((group) => {
    registry.add({
      id: `exact-${group.id}`,
      label: `Assignment ${group.id}`,
      type: 'hard',
      penalty: 100,
      evaluate: equalityConstraint(group.id, group.id, group.indices, group.target, 100),
      explanation: `Expected exactly ${group.target} selected variable(s).`
    });
  });
  return registry;
}

export function composeObjective(baseObjective: number, evaluations: ConstraintEvaluation[]): number {
  return baseObjective + totalPenalty(evaluations);
}

export function validateBinaryVector(state: BinaryVector, expectedLength: number): string[] {
  const issues: string[] = [];
  if (state.length !== expectedLength) issues.push(`Expected ${expectedLength} variables, received ${state.length}.`);
  state.forEach((value, index) => {
    if (value !== 0 && value !== 1) issues.push(`Variable ${index} is not binary.`);
  });
  return issues;
}

export function binaryStateFromThreshold(scores: number[], threshold = 0.5): BinaryVector {
  return scores.map((score) => score >= threshold ? 1 : 0);
}

export function oneHot(length: number, index: number): BinaryVector {
  return Array.from({ length }, (_, i) => i === index ? 1 : 0);
}

export function cardinality(state: BinaryVector): number {
  return state.reduce((sum, value) => sum + (value ? 1 : 0), 0);
}

export function hammingDistance(a: BinaryVector, b: BinaryVector): number {
  const length = Math.max(a.length, b.length);
  let distance = 0;
  for (let i = 0; i < length; i += 1) if ((a[i] ?? 0) !== (b[i] ?? 0)) distance += 1;
  return distance;
}

export function repairAtMost(state: BinaryVector, indices: number[], target: number): BinaryVector {
  if (indices.filter((i) => state[i] === 1).length <= target) return [...state];
  const repaired = [...state];
  let remaining = target;
  indices.forEach((index) => {
    if (repaired[index] === 1) {
      if (remaining > 0) remaining -= 1;
      else repaired[index] = 0;
    }
  });
  return repaired;
}
