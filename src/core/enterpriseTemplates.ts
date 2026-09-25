import type { OptimizationProblem, OptimizationInput } from '../domain';
import { createEmptyQubo, addExactlyOne, addAtMostOne } from './qubo';

export interface EnterpriseTemplate {
  id: string;
  name: string;
  domain: OptimizationProblem['domain'];
  problem: string;
  objective: string;
  decisionPattern: string;
  quantumEncoding: string;
  businessKpis: string[];
  constraints: string[];
  proofQuestion: string;
}

export const enterpriseTemplates: EnterpriseTemplate[] = [
  {
    id: 'vehicle-routing', name: 'Vehicle routing', domain: 'delivery',
    problem: 'Assign stops to routes and sequence work across vehicles.',
    objective: 'Minimize distance, lateness, and operating cost.',
    decisionPattern: 'binary assignment + route order', quantumEncoding: 'assignment QUBO + routing penalty terms',
    businessKpis: ['distance', 'cost', 'on-time rate', 'vehicle utilization'],
    constraints: ['capacity', 'service windows', 'shift duration', 'visit exactly once'],
    proofQuestion: 'Can a reduced routing kernel be solved faster or with a better quality-cost tradeoff?'
  },
  {
    id: 'flight-scheduling', name: 'Flight scheduling', domain: 'generic',
    problem: 'Allocate aircraft and time slots across a constrained schedule.',
    objective: 'Maximize schedule value while minimizing conflicts and delays.',
    decisionPattern: 'binary flight-slot assignment', quantumEncoding: 'QUBO with exactly-one and conflict penalties',
    businessKpis: ['on-time departure', 'aircraft utilization', 'delay minutes', 'schedule value'],
    constraints: ['aircraft uniqueness', 'slot conflicts', 'crew constraints', 'maintenance windows'],
    proofQuestion: 'Does a quantum-friendly reduced schedule preserve feasible high-value assignments?'
  },
  {
    id: 'sports-scheduling', name: 'Sports scheduling', domain: 'generic',
    problem: 'Build a season schedule under venue and travel constraints.',
    objective: 'Minimize travel and conflicts while preserving commercial objectives.',
    decisionPattern: 'match-to-slot assignment', quantumEncoding: 'binary assignment QUBO',
    businessKpis: ['travel', 'venue utilization', 'prime slots', 'conflict count'],
    constraints: ['venue', 'team availability', 'travel gap', 'broadcast commitments'],
    proofQuestion: 'Can the same formulation support repeated scenario generation?'
  },
  {
    id: 'ad-placement', name: 'Ad placement', domain: 'adPlacement',
    problem: 'Choose placements subject to inventory and audience constraints.',
    objective: 'Maximize expected value and relevance under a budget.',
    decisionPattern: 'binary placement selection', quantumEncoding: 'selection QUBO with budget and diversity penalties',
    businessKpis: ['expected revenue', 'reach', 'conversion', 'inventory utilization'],
    constraints: ['budget', 'frequency caps', 'inventory', 'category diversity'],
    proofQuestion: 'Can a small placement kernel be searched more effectively under tight constraints?'
  },
  {
    id: 'clinical-enrollment', name: 'Clinical trial enrollment', domain: 'generic',
    problem: 'Select and schedule enrollment actions under capacity and eligibility constraints.',
    objective: 'Maximize recruitment progress while minimizing delay and site imbalance.',
    decisionPattern: 'candidate-site-time assignment', quantumEncoding: 'binary selection/assignment QUBO',
    businessKpis: ['enrollment rate', 'site utilization', 'time-to-target', 'cost per enrollee'],
    constraints: ['eligibility', 'site capacity', 'time windows', 'geographic balance'],
    proofQuestion: 'Can a scheduling kernel improve target attainment under the same eligibility rules?'
  },
  {
    id: 'manufacturing-process', name: 'Manufacturing process sequencing', domain: 'manufacturing',
    problem: 'Sequence jobs across stations while limiting changeovers and missed deadlines.',
    objective: 'Minimize makespan and changeover cost.',
    decisionPattern: 'job-to-position and job-to-machine assignment', quantumEncoding: 'assignment QUBO with sequencing penalties',
    businessKpis: ['makespan', 'throughput', 'changeover minutes', 'late jobs'],
    constraints: ['machine capacity', 'precedence', 'maintenance', 'due dates'],
    proofQuestion: 'Can a reduced sequencing kernel improve the objective without adding infeasibility?'
  },
  {
    id: 'forecast-allocation', name: 'Forecast-to-capacity allocation', domain: 'generic',
    problem: 'Allocate limited capacity against uncertain demand scenarios.',
    objective: 'Maximize service value while controlling under/over allocation.',
    decisionPattern: 'discrete allocation', quantumEncoding: 'binary bucket selection with scenario penalties',
    businessKpis: ['service level', 'waste', 'stockout exposure', 'capacity utilization'],
    constraints: ['capacity', 'minimum service', 'supplier limits', 'buffer policy'],
    proofQuestion: 'Does a scenario-aware optimization reduce tail-risk cost versus a greedy plan?'
  },
  {
    id: 'reinsurance', name: 'Reinsurance allocation', domain: 'generic',
    problem: 'Allocate layers across treaties under risk and capital constraints.',
    objective: 'Balance expected economics against tail-risk and concentration.',
    decisionPattern: 'binary layer selection', quantumEncoding: 'QUBO for selection with risk penalties',
    businessKpis: ['expected loss', 'tail risk', 'capital use', 'premium margin'],
    constraints: ['counterparty exposure', 'capital', 'retention', 'layer limits'],
    proofQuestion: 'Can a small candidate layer set expose useful tradeoffs for further classical/quantum study?'
  },
  {
    id: 'energy-unit-commitment', name: 'Energy unit commitment', domain: 'energy',
    problem: 'Decide which generation units are online across time periods.',
    objective: 'Minimize operating and startup cost while meeting demand.',
    decisionPattern: 'binary unit-time commitment', quantumEncoding: 'QUBO with demand balance and startup penalties',
    businessKpis: ['generation cost', 'reserve margin', 'startup count', 'constraint violations'],
    constraints: ['demand', 'minimum up/down', 'ramp', 'reserve'],
    proofQuestion: 'Can a reduced commitment kernel be compared fairly against an operations-research baseline?'
  },
  {
    id: 'portfolio', name: 'Portfolio optimization', domain: 'portfolio',
    problem: 'Choose assets under return, risk, liquidity, and concentration policies.',
    objective: 'Maximize expected return under risk controls.',
    decisionPattern: 'binary asset selection', quantumEncoding: 'asset-selection QUBO',
    businessKpis: ['return', 'risk', 'liquidity', 'sector diversity'],
    constraints: ['max holdings', 'risk ceiling', 'liquidity floor', 'sector rules'],
    proofQuestion: 'Does the hybrid pipeline produce useful candidate portfolios on reduced kernels?'
  },
  {
    id: 'robot-path', name: 'Robot motion / seam path', domain: 'robotics',
    problem: 'Sequence robot tasks across stations to reduce total process time.',
    objective: 'Minimize makespan and travel/changeover friction.',
    decisionPattern: 'task-to-robot assignment + sequence', quantumEncoding: 'assignment QUBO and graph penalties',
    businessKpis: ['makespan', 'throughput', 'travel', 'minutes saved'],
    constraints: ['robot capacity', 'shift', 'station compatibility', 'precedence'],
    proofQuestion: 'Does a reduced kernel capture the dominant path interactions?'
  },
  {
    id: 'workforce', name: 'Workforce rostering', domain: 'workforce',
    problem: 'Assign qualified workers to shifts while balancing cost and coverage.',
    objective: 'Minimize staffing cost plus penalties.',
    decisionPattern: 'worker-shift assignment', quantumEncoding: 'exactly-one assignment QUBO',
    businessKpis: ['labor cost', 'coverage', 'overtime', 'fairness'],
    constraints: ['skills', 'coverage', 'availability', 'shift limits'],
    proofQuestion: 'Can a smaller shift-assignment kernel reveal useful schedules for comparison?'
  }
];

export function getTemplate(id: string): EnterpriseTemplate | undefined {
  return enterpriseTemplates.find((template) => template.id === id);
}

export function templateToSummary(template: EnterpriseTemplate): string[] {
  return [
    template.name,
    template.problem,
    `Objective: ${template.objective}`,
    `Decision pattern: ${template.decisionPattern}`,
    `Quantum encoding: ${template.quantumEncoding}`,
    `KPIs: ${template.businessKpis.join(', ')}`,
    `Constraints: ${template.constraints.join(', ')}`,
    `Proof question: ${template.proofQuestion}`
  ];
}

export function createTemplateQubo(template: EnterpriseTemplate, variables: number): ReturnType<typeof createEmptyQubo> {
  const n = Math.min(60, Math.max(4, variables));
  const model = createEmptyQubo(n, Array.from({ length: n }, (_, index) => `${template.id}_x${index}`));
  const assignmentGroups = Math.max(1, Math.floor(n / 6));
  for (let group = 0; group < assignmentGroups; group += 1) {
    const start = group * 6;
    const indices = Array.from({ length: Math.min(6, n - start) }, (_, offset) => start + offset);
    if (indices.length > 1) addExactlyOne(model, indices, 4, `${template.name} group ${group + 1}`);
  }
  addAtMostOne(model, Array.from({ length: n }, (_, index) => index), 0.05, `${template.name} concentration`);
  return model;
}

export function templateFromProblem(problem: OptimizationProblem): EnterpriseTemplate {
  return {
    id: problem.id,
    name: problem.name,
    domain: problem.domain,
    problem: problem.description,
    objective: problem.objective,
    decisionPattern: 'domain-specific decision variables',
    quantumEncoding: 'binary QUBO / Ising candidate',
    businessKpis: [],
    constraints: problem.constraints.map(c => c.label),
    proofQuestion: 'What happens when the same model is benchmarked across classical and quantum backends?'
  };
}

export function scenarioFingerprint(input: OptimizationInput): string {
  return [input.problem.id, input.solver, input.seed, input.iterations, JSON.stringify(input.scenarioData)].join('|');
}
