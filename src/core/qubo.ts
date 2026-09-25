import type { Constraint, QuboModel } from '../domain';

export interface QuboBuilderOptions {
  variableLabels: string[];
  linear?: number[];
  quadratic?: Record<string, number>;
  offset?: number;
  constraints?: Constraint[];
}

export function createEmptyQubo(n: number, variableLabels?: string[]): QuboModel {
  return {
    n,
    offset: 0,
    linear: Array(n).fill(0),
    quadratic: {},
    variableLabels: variableLabels ?? Array.from({ length: n }, (_, i) => `x${i}`),
    constraints: []
  };
}

function pairKey(i: number, j: number): string {
  return i < j ? `${i},${j}` : `${j},${i}`;
}

export function addLinear(model: QuboModel, index: number, coefficient: number): QuboModel {
  model.linear[index] = (model.linear[index] ?? 0) + coefficient;
  return model;
}

export function addQuadratic(model: QuboModel, i: number, j: number, coefficient: number): QuboModel {
  if (i === j) return addLinear(model, i, coefficient);
  const key = pairKey(i, j);
  model.quadratic[key] = (model.quadratic[key] ?? 0) + coefficient;
  return model;
}

export function addExactlyOne(model: QuboModel, indices: number[], penalty: number, label: string): QuboModel {
  // Penalty * (sum(x_i) - 1)^2. Since x_i^2 = x_i for binary variables,
  // each linear term receives -penalty and each pair receives 2*penalty.
  indices.forEach((index) => addLinear(model, index, -penalty));
  for (let i = 0; i < indices.length; i += 1) {
    for (let j = i + 1; j < indices.length; j += 1) {
      addQuadratic(model, indices[i], indices[j], 2 * penalty);
    }
  }
  model.offset += penalty;
  model.constraints.push(`${label}: exactly one selected`);
  return model;
}

export function addAtMostOne(model: QuboModel, indices: number[], penalty: number, label: string): QuboModel {
  for (let i = 0; i < indices.length; i += 1) {
    for (let j = i + 1; j < indices.length; j += 1) {
      addQuadratic(model, indices[i], indices[j], penalty);
    }
  }
  model.constraints.push(`${label}: at most one selected`);
  return model;
}

export function addCardinalityBand(
  model: QuboModel,
  indices: number[],
  target: number,
  penalty: number,
  label: string
): QuboModel {
  // Introduces no auxiliary bits; compactly approximates the cardinality target.
  // For a demo/POC this is useful because it exposes the optimization structure
  // without pretending an arbitrary integer slack encoding is free.
  indices.forEach((index) => addLinear(model, index, penalty * (1 - 2 * target)));
  for (let i = 0; i < indices.length; i += 1) {
    for (let j = i + 1; j < indices.length; j += 1) {
      addQuadratic(model, indices[i], indices[j], 2 * penalty);
    }
  }
  model.offset += penalty * target * target;
  model.constraints.push(`${label}: target cardinality ${target}`);
  return model;
}

export function buildQubo(options: QuboBuilderOptions): QuboModel {
  const model = createEmptyQubo(options.variableLabels.length, options.variableLabels);
  model.offset = options.offset ?? 0;
  if (options.linear) options.linear.forEach((value, index) => addLinear(model, index, value));
  if (options.quadratic) {
    Object.entries(options.quadratic).forEach(([key, coefficient]) => {
      const [i, j] = key.split(',').map(Number);
      addQuadratic(model, i, j, coefficient);
    });
  }
  if (options.constraints) model.constraints.push(...options.constraints.map((c) => `${c.label}: ${c.description}`));
  return model;
}

export function evaluateQubo(model: QuboModel, x: number[]): number {
  let value = model.offset;
  for (let i = 0; i < model.n; i += 1) value += (model.linear[i] ?? 0) * (x[i] ?? 0);
  Object.entries(model.quadratic).forEach(([key, coefficient]) => {
    const [i, j] = key.split(',').map(Number);
    value += coefficient * (x[i] ?? 0) * (x[j] ?? 0);
  });
  return value;
}

export function quboToIsing(model: QuboModel): { J: Record<string, number>; h: number[]; offset: number } {
  // x=(1-z)/2. This returns a conventional Ising form H = sum J_ij z_i z_j + sum h_i z_i + offset.
  const h = Array(model.n).fill(0);
  const J: Record<string, number> = {};
  let offset = model.offset;
  for (let i = 0; i < model.n; i += 1) {
    const a = model.linear[i] ?? 0;
    h[i] += -a / 2;
    offset += a / 2;
  }
  Object.entries(model.quadratic).forEach(([key, coefficient]) => {
    const [i, j] = key.split(',').map(Number);
    const c = coefficient;
    J[key] = c / 4;
    h[i] += -c / 4;
    h[j] += -c / 4;
    offset += c / 4;
  });
  return { J, h, offset };
}

export function serializeQubo(model: QuboModel): string {
  return JSON.stringify(model, null, 2);
}
