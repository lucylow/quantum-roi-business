import type { Asset, Decision, Metric, OptimizationProblem, PortfolioScenario, SolverTrace } from '../domain';
import { randomKeyOptimize } from './rko';
import { mean, sumBy } from './math';

export interface PortfolioSolution {
  decisions: Decision[];
  metrics: Metric[];
  trace: SolverTrace[];
  objective: number;
  baselineObjective: number;
  violations: string[];
}

function portfolioStats(selected: Asset[], scenario: PortfolioScenario) {
  if (!selected.length) return { ret: 0, risk: 1, liquidity: 0, diversification: 0 };
  const total = selected.length;
  const ret = mean(selected.map((a) => a.expectedReturn));
  const risk = mean(selected.map((a) => a.risk));
  const liquidity = mean(selected.map((a) => a.liquidity));
  const sectors = new Set(selected.map((a) => a.sector));
  return { ret, risk, liquidity, diversification: sectors.size / Math.max(1, total) };
}

export function optimizePortfolio(problem: OptimizationProblem, scenario: PortfolioScenario, seed: number, iterations: number): PortfolioSolution {
  const n = scenario.assets.length;
  const decode = (keys: number[]): number[] => {
    const scores = keys.map((key, index) => ({ key, index })).sort((a, b) => b.key - a.key);
    return scores.slice(0, Math.min(scenario.maxAssets, scores.length)).map((x) => x.index);
  };

  const score = (indices: number[]): number => {
    const selected = indices.map((i) => scenario.assets[i]);
    const stats = portfolioStats(selected, scenario);
    const returnGap = Math.max(0, scenario.targetReturn - stats.ret);
    const riskOverflow = Math.max(0, stats.risk - scenario.maxRisk);
    const liquidityGap = Math.max(0, scenario.minLiquidity - stats.liquidity);
    return -stats.ret + riskOverflow * 10 + returnGap * 8 + liquidityGap * 6;
  };

  const baseline = decode(Array.from({ length: n }, (_, i) => i / Math.max(1, n - 1)));
  const rko = randomKeyOptimize({
    dimensions: n,
    populationSize: 24,
    iterations: Math.max(10, iterations),
    seed,
    decoder: decode,
    fitness: score
  });

  const selected = rko.decision.map((i) => scenario.assets[i]);
  const baselineAssets = baseline.map((i) => scenario.assets[i]);
  const stats = portfolioStats(selected, scenario);
  const baselineStats = portfolioStats(baselineAssets, scenario);
  const objective = score(rko.decision);
  const baselineObjective = score(baseline);
  const violations: string[] = [];
  if (stats.risk > scenario.maxRisk) violations.push(`Risk exceeds the ${scenario.maxRisk.toFixed(1)}% policy ceiling.`);
  if (stats.ret < scenario.targetReturn) violations.push(`Expected return is below the ${scenario.targetReturn.toFixed(1)}% target.`);
  if (stats.liquidity < scenario.minLiquidity) violations.push(`Liquidity is below the ${scenario.minLiquidity.toFixed(1)}% floor.`);

  const selectedIds = new Set(selected.map((a) => a.id));
  const decisions: Decision[] = scenario.assets.map((asset) => ({
    id: asset.id,
    label: asset.name,
    selected: selectedIds.has(asset.id),
    score: asset.expectedReturn - asset.risk,
    metadata: { sector: asset.sector, expectedReturn: asset.expectedReturn, risk: asset.risk, liquidity: asset.liquidity }
  }));

  const totalCapital = 10_000_000;
  const weight = 1 / Math.max(1, selected.length);
  const metrics: Metric[] = [
    { id: 'return', label: 'Expected return', value: stats.ret, unit: '%', direction: 'maximize', baseline: baselineStats.ret, improvement: stats.ret - baselineStats.ret },
    { id: 'risk', label: 'Portfolio risk', value: stats.risk, unit: '%', direction: 'minimize', baseline: baselineStats.risk, improvement: baselineStats.risk - stats.risk },
    { id: 'liquidity', label: 'Liquidity score', value: stats.liquidity, unit: '%', direction: 'maximize', baseline: baselineStats.liquidity },
    { id: 'capital', label: 'Capital represented', value: selected.length * weight * totalCapital, unit: 'USD', direction: 'maximize' },
    { id: 'diversification', label: 'Sector coverage', value: stats.diversification * 100, unit: '%', direction: 'maximize' }
  ];

  void problem;
  return { decisions, metrics, trace: rko.trace, objective, baselineObjective, violations };
}
