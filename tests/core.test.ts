import { buildQubo, evaluateQubo, quboToIsing } from '../src/core/qubo';
import { seededRandom, haversineKm, normalize } from '../src/core/math';
import { assessQuantumReadiness } from '../src/core/readiness';
import { useCases, portfolioScenario } from '../src/data/mock';
import { buildDomainQubo } from '../src/core/quboDomain';

describe('math primitives', () => {
  test('seeded random is reproducible', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  test('normalization clamps to range', () => {
    expect(normalize(-1, 0, 1)).toBe(0);
    expect(normalize(0.5, 0, 1)).toBe(0.5);
    expect(normalize(2, 0, 1)).toBe(1);
  });
  test('haversine has zero distance at the same point', () => {
    expect(haversineKm([1, 2], [1, 2])).toBeCloseTo(0);
  });
});

describe('QUBO', () => {
  test('builds and evaluates a simple model', () => {
    const q = buildQubo({ variableLabels: ['a', 'b'], linear: [1, 2], quadratic: { '0,1': 3 }, offset: 4 });
    expect(evaluateQubo(q, [1, 0])).toBe(5);
    expect(evaluateQubo(q, [1, 1])).toBe(10);
  });
  test('converts to Ising', () => {
    const q = buildQubo({ variableLabels: ['a', 'b'], linear: [1, 2], quadratic: { '0,1': 3 }, offset: 4 });
    const ising = quboToIsing(q);
    expect(ising.h).toHaveLength(2);
    expect(ising.J['0,1']).toBeCloseTo(0.75);
  });
});

describe('domain model', () => {
  test('portfolio produces a QUBO with one variable per asset', () => {
    const problem = useCases.find(p => p.domain === 'portfolio')!;
    const model = buildDomainQubo(problem, portfolioScenario);
    expect(model.n).toBe(portfolioScenario.assets.length);
    expect(model.variableLabels[0]).toBe(portfolioScenario.assets[0].id);
  });
  test('readiness remains bounded', () => {
    const problem = useCases[0];
    const data = require('../src/data/mock').deliveryScenario;
    const model = buildDomainQubo(problem, data);
    const r = assessQuantumReadiness(problem, model);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
