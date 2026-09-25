import { enterpriseTemplates } from './enterpriseTemplates';

export interface ScenarioSeed {
  id: string;
  name: string;
  domain: string;
  scale: 'toy' | 'pilot' | 'enterprise';
  narrative: string;
  variables: number;
  constraints: string[];
  kpis: string[];
  dataSources: string[];
  owner: string;
}

const names = [
  'Urban next-day network', 'Regional next-day network', 'Cross-border middle-mile', 'Warehouse labor plan',
  'Customer support rostering', 'Clinical staffing plan', 'Diversified growth portfolio', 'Treasury liquidity mix',
  'Robot seam sequence', 'Pick-pack robot cells', 'Ad inventory allocation', 'Promotion slot selection',
  'Flight gate assignment', 'Sports venue calendar', 'Trial site enrollment', 'Manufacturing line sequence',
  'Forecast-to-capacity allocation', 'Reinsurance layer selection', 'Energy unit commitment', 'Battery charge scheduling'
];

const domains = [
  'delivery', 'delivery', 'delivery', 'workforce', 'workforce', 'workforce', 'portfolio', 'portfolio',
  'robotics', 'robotics', 'adPlacement', 'adPlacement', 'generic', 'generic', 'generic', 'manufacturing',
  'generic', 'generic', 'energy', 'energy'
];

const scale: ScenarioSeed['scale'][] = ['toy', 'pilot', 'pilot', 'pilot', 'pilot', 'enterprise', 'pilot', 'enterprise', 'pilot', 'enterprise', 'toy', 'pilot', 'pilot', 'pilot', 'enterprise', 'enterprise', 'enterprise', 'enterprise', 'pilot', 'enterprise'];

const narratives = [
  'Balance service windows against route cost and fleet capacity.',
  'Explore kernel reduction before expensive cloud experiments.',
  'Protect service commitments while increasing network efficiency.',
  'Cover qualified shifts while reducing avoidable labor cost.',
  'Model staffing volatility and preserve coverage under demand spikes.',
  'Trade cost and coverage under explicit staffing constraints.',
  'Select assets under return, risk, and liquidity policies.',
  'Balance liquidity needs against opportunity cost.',
  'Sequence robot work to reduce changeover and makespan.',
  'Balance workload across robot cells with hard shift limits.',
  'Select placements to maximize expected value within budget.',
  'Protect frequency caps and diversity while maximizing value.',
  'Assign flights to gates and slots without schedule conflict.',
  'Create a season calendar with venue and travel constraints.',
  'Assign candidates to sites under eligibility and capacity rules.',
  'Sequence manufacturing tasks to reduce changeovers and lateness.',
  'Allocate limited capacity under demand uncertainty.',
  'Select reinsurance layers while controlling concentration.',
  'Commit generation units while meeting demand and reserves.',
  'Schedule battery charging under energy price and capacity limits.'
];

const kpis = [
  ['cost', 'service', 'distance'], ['cost', 'service', 'capacity'], ['cost', 'speed', 'service'], ['labor cost', 'coverage', 'fairness'],
  ['labor cost', 'coverage', 'overtime'], ['cost', 'coverage', 'availability'], ['return', 'risk', 'liquidity'], ['cash yield', 'liquidity', 'risk'],
  ['makespan', 'throughput', 'changeover'], ['cycle time', 'utilization', 'throughput'], ['revenue', 'reach', 'conversion'], ['revenue', 'reach', 'diversity'],
  ['delay', 'utilization', 'conflicts'], ['travel', 'venue use', 'broadcast value'], ['enrollment', 'cost', 'time'], ['makespan', 'late jobs', 'changeover'],
  ['service', 'waste', 'stockouts'], ['premium', 'tail risk', 'capital'], ['generation cost', 'reserve', 'startup'], ['energy cost', 'peak load', 'comfort']
];

const constraints = [
  ['capacity', 'time windows', 'visit once'], ['capacity', 'service windows', 'shift'], ['network capacity', 'service', 'handoff'], ['skills', 'coverage', 'availability'],
  ['skills', 'coverage', 'demand', 'rest'], ['skills', 'coverage', 'shift limits'], ['max holdings', 'risk ceiling', 'liquidity'], ['liquidity', 'counterparty', 'cash floor'],
  ['robot capacity', 'shift', 'station compatibility'], ['robot capacity', 'precedence', 'maintenance'], ['budget', 'frequency', 'inventory'], ['budget', 'inventory', 'diversity'],
  ['gate', 'slot', 'aircraft'], ['venue', 'team availability', 'travel'], ['eligibility', 'site capacity', 'geography'], ['machine capacity', 'precedence', 'maintenance'],
  ['capacity', 'minimum service', 'buffers'], ['capital', 'retention', 'counterparty'], ['demand', 'reserve', 'ramp'], ['charge window', 'battery limits', 'price']
];

const sources = [
  ['orders', 'stations', 'fleet telemetry'], ['orders', 'road times', 'station capacity'], ['lane demand', 'sort centers', 'transport contracts'], ['shift demand', 'worker skills', 'availability'],
  ['tickets', 'skills', 'SLA demand'], ['demand forecast', 'worker registry', 'facility hours'], ['market assumptions', 'risk model', 'policy constraints'], ['cash forecast', 'instrument pricing', 'liquidity buckets'],
  ['robot tasks', 'station map', 'cycle times'], ['robot telemetry', 'maintenance calendar', 'task graph'], ['inventory', 'audience segments', 'bid signals'], ['placement inventory', 'audience reach', 'campaign budgets'],
  ['flight schedule', 'gate map', 'aircraft state'], ['league calendar', 'venues', 'travel times'], ['eligibility pool', 'site capacity', 'enrollment history'], ['job queue', 'machine state', 'maintenance'],
  ['forecast scenarios', 'capacity plan', 'service targets'], ['layer table', 'loss curves', 'capital rules'], ['demand forecast', 'unit constraints', 'fuel cost'], ['tariffs', 'battery state', 'charge windows']
];

export const scenarioCatalog: ScenarioSeed[] = names.map((name, i) => ({
  id: `scenario-${String(i + 1).padStart(3, '0')}`,
  name,
  domain: domains[i],
  scale: scale[i],
  narrative: narratives[i],
  variables: 12 + i * 7,
  constraints: constraints[i],
  kpis: kpis[i],
  dataSources: sources[i],
  owner: i % 2 === 0 ? 'Operations Research' : 'Advanced Analytics'
}));

export function searchScenarios(query: string): ScenarioSeed[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return scenarioCatalog;
  return scenarioCatalog.filter((scenario) => [scenario.name, scenario.domain, scenario.narrative, ...scenario.kpis, ...scenario.constraints].join(' ').toLowerCase().includes(needle));
}

export function scenarioByDomain(domain: string): ScenarioSeed[] { return scenarioCatalog.filter(s => s.domain === domain); }
export function scenarioByScale(scaleValue: ScenarioSeed['scale']): ScenarioSeed[] { return scenarioCatalog.filter(s => s.scale === scaleValue); }
export function scenarioById(id: string): ScenarioSeed | undefined { return scenarioCatalog.find(s => s.id === id); }

export function scenarioToProblem(seed: ScenarioSeed) {
  return {
    id: seed.id,
    name: seed.name,
    domain: seed.domain,
    description: seed.narrative,
    objective: `Optimize ${seed.kpis.slice(0, 2).join(' and ')}`,
    direction: 'minimize' as const,
    scale: seed.variables / 10,
    variables: seed.variables,
    constraints: seed.constraints.map((label, index) => ({ id: `${seed.id}-c${index}`, label, type: index < 2 ? 'hard' as const : 'soft' as const, penalty: index < 2 ? 100 : 2, enabled: true, description: `${label} must be respected by the planning model.` })),
    assumptions: seed.dataSources.map((label, index) => ({ id: `${seed.id}-a${index}`, label, value: index + 1, unit: 'input', editable: true })),
    tags: [seed.domain, seed.scale, seed.owner]
  };
}

export function catalogCoverageReport(): Record<string, number> {
  const result: Record<string, number> = {};
  scenarioCatalog.forEach((s) => { result[s.domain] = (result[s.domain] ?? 0) + 1; });
  enterpriseTemplates.forEach((template) => { result[template.domain] = Math.max(result[template.domain] ?? 0, 1); });
  return result;
}
