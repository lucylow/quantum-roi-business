export type ScreenName =
  | 'home'
  | 'useCases'
  | 'scenario'
  | 'results'
  | 'insights'
  | 'compare'
  | 'experiment'
  | 'qubo'
  | 'settings';

export type OptimizationDomain =
  | 'delivery'
  | 'workforce'
  | 'portfolio'
  | 'robotics'
  | 'adPlacement'
  | 'manufacturing'
  | 'energy'
  | 'generic';

export type SolverKind = 'rko' | 'simulatedAnnealing' | 'greedy' | 'quantumMock' | 'braket';
export type ObjectiveDirection = 'minimize' | 'maximize';
export type ConstraintType = 'hard' | 'soft';

export interface NumericRange {
  min: number;
  max: number;
}

export interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  direction: ObjectiveDirection;
  baseline?: number;
  improvement?: number;
  confidence?: number;
}

export interface Constraint {
  id: string;
  label: string;
  type: ConstraintType;
  penalty: number;
  enabled: boolean;
  description: string;
}

export interface BusinessAssumption {
  id: string;
  label: string;
  value: number;
  unit: string;
  editable: boolean;
}

export interface OptimizationProblem {
  id: string;
  name: string;
  domain: OptimizationDomain;
  description: string;
  objective: string;
  direction: ObjectiveDirection;
  scale: number;
  variables: number;
  constraints: Constraint[];
  assumptions: BusinessAssumption[];
  tags: string[];
}

export interface DeliveryStop {
  id: string;
  name: string;
  type: 'warehouse' | 'sortCenter' | 'deliveryStation' | 'customerCluster';
  lat: number;
  lon: number;
  demand: number;
  serviceMinutes: number;
  readyAt: number;
  dueAt: number;
}

export interface Vehicle {
  id: string;
  label: string;
  capacity: number;
  startNode: string;
  endNode: string;
  maxRouteMinutes: number;
  fixedCost: number;
  costPerKm: number;
}

export interface DeliveryScenario {
  stops: DeliveryStop[];
  vehicles: Vehicle[];
  averageSpeedKph: number;
  valuePerOnTimeStop: number;
  valuePerKmAvoided: number;
  routePenalty: number;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  skills: string[];
  hourlyCost: number;
}

export interface Shift {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
  requiredRole: string;
  demand: number;
}

export interface WorkforceScenario {
  workers: Worker[];
  shifts: Shift[];
  overtimeMultiplier: number;
  unfilledShiftPenalty: number;
}

export interface Asset {
  id: string;
  name: string;
  expectedReturn: number;
  risk: number;
  liquidity: number;
  sector: string;
}

export interface PortfolioScenario {
  assets: Asset[];
  targetReturn: number;
  maxRisk: number;
  maxAssets: number;
  minLiquidity: number;
}

export interface RobotTask {
  id: string;
  station: string;
  seamGroup: string;
  processingMinutes: number;
  changeoverMinutes: number;
  priority: number;
}

export interface RobotScenario {
  tasks: RobotTask[];
  robots: number;
  shiftMinutes: number;
  maxTravelMeters: number;
  valuePerMinuteSaved: number;
}

export interface OptimizationInput {
  problem: OptimizationProblem;
  solver: SolverKind;
  seed: number;
  iterations: number;
  scenarioData:
    | DeliveryScenario
    | WorkforceScenario
    | PortfolioScenario
    | RobotScenario;
}

export interface Decision {
  id: string;
  label: string;
  selected: boolean;
  score: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface SolverTrace {
  step: number;
  objective: number;
  bestObjective: number;
  feasibility: number;
  elapsedMs: number;
}

export interface QuboModel {
  n: number;
  offset: number;
  linear: number[];
  quadratic: Record<string, number>;
  variableLabels: string[];
  constraints: string[];
}

export interface QuantumReadiness {
  score: number;
  category: 'exploratory' | 'promising' | 'strong candidate' | 'classical-first';
  qubitsEstimate: number;
  embeddingOverhead: number;
  reasons: string[];
  recommendedNextStep: string;
}

export interface OptimizationResult {
  runId: string;
  problemId: string;
  solver: SolverKind;
  status: 'complete' | 'fallback' | 'queued' | 'error';
  objective: number;
  baselineObjective: number;
  objectiveDirection: ObjectiveDirection;
  metrics: Metric[];
  decisions: Decision[];
  trace: SolverTrace[];
  violations: string[];
  quantumReadiness: QuantumReadiness;
  qaoaEligible: boolean;
  durationMs: number;
  notes: string[];
}

export interface ExperimentRun {
  id: string;
  createdAt: string;
  scenarioName: string;
  domain: OptimizationDomain;
  solver: SolverKind;
  result: OptimizationResult;
}

export interface BusinessBrief {
  headline: string;
  subhead: string;
  impact: string;
  whyItMatters: string[];
  demoNarrative: string[];
}

export const DEFAULT_CONSTRAINTS: Constraint[] = [
  {
    id: 'hard-capacity',
    label: 'Capacity limits',
    type: 'hard',
    penalty: 100,
    enabled: true,
    description: 'Never allocate beyond physical or contractual capacity.'
  },
  {
    id: 'hard-coverage',
    label: 'Coverage / service',
    type: 'hard',
    penalty: 120,
    enabled: true,
    description: 'Every required node, shift, or demand segment must be handled.'
  },
  {
    id: 'soft-cost',
    label: 'Operating cost',
    type: 'soft',
    penalty: 1,
    enabled: true,
    description: 'Trade operating cost against business outcomes.'
  },
  {
    id: 'soft-service',
    label: 'Service quality',
    type: 'soft',
    penalty: 2,
    enabled: true,
    description: 'Protect delivery, staffing, or customer service targets.'
  }
];
