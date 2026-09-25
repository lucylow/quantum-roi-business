import type {
  Asset,
  BusinessBrief,
  DeliveryScenario,
  OptimizationProblem,
  PortfolioScenario,
  RobotScenario,
  Worker,
  WorkforceScenario,
  Shift,
  DeliveryStop,
  Vehicle,
  RobotTask,
  Constraint,
  BusinessAssumption
} from '../domain';

export const sharedConstraints: Constraint[] = [
  { id: 'hard-capacity', label: 'Capacity limits', type: 'hard', penalty: 100, enabled: true, description: 'Respect physical, labor, or portfolio capacity.' },
  { id: 'hard-service', label: 'Service commitments', type: 'hard', penalty: 120, enabled: true, description: 'Protect contractual or customer-facing service requirements.' },
  { id: 'soft-cost', label: 'Operating cost', type: 'soft', penalty: 1, enabled: true, description: 'Minimize controllable operating cost.' },
  { id: 'soft-risk', label: 'Risk / variability', type: 'soft', penalty: 2, enabled: true, description: 'Penalize unstable or concentrated choices.' }
];

const assumptions = (items: Array<[string, string, number, string]>): BusinessAssumption[] => items.map(([id, label, value, unit]) => ({ id, label, value, unit, editable: true }));

export const deliveryStops: DeliveryStop[] = [
  { id: 'SW-SEA', name: 'Seattle Supply Warehouse', type: 'warehouse', lat: 47.60, lon: -122.33, demand: 0, serviceMinutes: 0, readyAt: 0, dueAt: 1440 },
  { id: 'SC-N', name: 'North Sort Center', type: 'sortCenter', lat: 47.71, lon: -122.20, demand: 80, serviceMinutes: 15, readyAt: 450, dueAt: 650 },
  { id: 'DS-BV', name: 'Bellevue Delivery Station', type: 'deliveryStation', lat: 47.61, lon: -122.20, demand: 70, serviceMinutes: 20, readyAt: 430, dueAt: 690 },
  { id: 'DS-SO', name: 'South Station', type: 'deliveryStation', lat: 47.48, lon: -122.28, demand: 65, serviceMinutes: 18, readyAt: 430, dueAt: 710 },
  { id: 'CC-01', name: 'Downtown Customer Cluster', type: 'customerCluster', lat: 47.61, lon: -122.34, demand: 30, serviceMinutes: 12, readyAt: 500, dueAt: 780 },
  { id: 'CC-02', name: 'Eastside Customer Cluster', type: 'customerCluster', lat: 47.67, lon: -122.11, demand: 35, serviceMinutes: 12, readyAt: 500, dueAt: 760 },
  { id: 'CC-03', name: 'Airport Customer Cluster', type: 'customerCluster', lat: 47.44, lon: -122.30, demand: 40, serviceMinutes: 12, readyAt: 500, dueAt: 760 },
  { id: 'CC-04', name: 'North Customer Cluster', type: 'customerCluster', lat: 47.73, lon: -122.32, demand: 28, serviceMinutes: 10, readyAt: 520, dueAt: 790 },
  { id: 'CC-05', name: 'Kirkland Customer Cluster', type: 'customerCluster', lat: 47.68, lon: -122.20, demand: 32, serviceMinutes: 10, readyAt: 515, dueAt: 765 }
];

export const deliveryVehicles: Vehicle[] = [
  { id: 'VAN-01', label: 'Route 01', capacity: 130, startNode: 'SW-SEA', endNode: 'SW-SEA', maxRouteMinutes: 480, fixedCost: 115, costPerKm: 1.45 },
  { id: 'VAN-02', label: 'Route 02', capacity: 130, startNode: 'SW-SEA', endNode: 'SW-SEA', maxRouteMinutes: 480, fixedCost: 115, costPerKm: 1.45 },
  { id: 'VAN-03', label: 'Route 03', capacity: 115, startNode: 'SW-SEA', endNode: 'SW-SEA', maxRouteMinutes: 480, fixedCost: 105, costPerKm: 1.55 }
];

export const deliveryScenario: DeliveryScenario = {
  stops: deliveryStops,
  vehicles: deliveryVehicles,
  averageSpeedKph: 42,
  valuePerOnTimeStop: 18,
  valuePerKmAvoided: 2.2,
  routePenalty: 85
};

export const workforceWorkers: Worker[] = [
  { id: 'W-01', name: 'Avery', role: 'RN', skills: ['triage', 'RN'], hourlyCost: 47 },
  { id: 'W-02', name: 'Blair', role: 'RN', skills: ['triage', 'RN', 'lead'], hourlyCost: 52 },
  { id: 'W-03', name: 'Casey', role: 'Tech', skills: ['Tech', 'intake'], hourlyCost: 31 },
  { id: 'W-04', name: 'Devon', role: 'RN', skills: ['RN', 'intake'], hourlyCost: 49 },
  { id: 'W-05', name: 'Emery', role: 'Tech', skills: ['Tech', 'triage'], hourlyCost: 33 },
  { id: 'W-06', name: 'Finley', role: 'RN', skills: ['RN', 'lead'], hourlyCost: 55 },
  { id: 'W-07', name: 'Gray', role: 'Tech', skills: ['Tech'], hourlyCost: 30 },
  { id: 'W-08', name: 'Harper', role: 'RN', skills: ['RN', 'triage'], hourlyCost: 48 }
];

export const workforceShifts: Shift[] = [
  { id: 'S-01', label: 'Morning intake', startHour: 7, endHour: 11, requiredRole: 'Tech', demand: 28 },
  { id: 'S-02', label: 'Morning clinical', startHour: 8, endHour: 12, requiredRole: 'RN', demand: 24 },
  { id: 'S-03', label: 'Midday intake', startHour: 11, endHour: 15, requiredRole: 'Tech', demand: 32 },
  { id: 'S-04', label: 'Midday clinical', startHour: 12, endHour: 16, requiredRole: 'RN', demand: 30 },
  { id: 'S-05', label: 'Afternoon intake', startHour: 15, endHour: 19, requiredRole: 'Tech', demand: 26 },
  { id: 'S-06', label: 'Afternoon clinical', startHour: 16, endHour: 20, requiredRole: 'RN', demand: 31 },
  { id: 'S-07', label: 'Close / recovery', startHour: 19, endHour: 22, requiredRole: 'Tech', demand: 19 },
  { id: 'S-08', label: 'Close / clinical', startHour: 20, endHour: 23, requiredRole: 'RN', demand: 20 }
];

export const workforceScenario: WorkforceScenario = {
  workers: workforceWorkers,
  shifts: workforceShifts,
  overtimeMultiplier: 1.5,
  unfilledShiftPenalty: 450
};

export const portfolioAssets: Asset[] = [
  { id: 'A01', name: 'Logistics infrastructure', expectedReturn: 9.2, risk: 5.8, liquidity: 88, sector: 'Infrastructure' },
  { id: 'A02', name: 'Cloud services', expectedReturn: 12.4, risk: 8.2, liquidity: 94, sector: 'Technology' },
  { id: 'A03', name: 'Industrial automation', expectedReturn: 10.6, risk: 6.9, liquidity: 82, sector: 'Industrials' },
  { id: 'A04', name: 'Consumer staples', expectedReturn: 6.1, risk: 3.4, liquidity: 97, sector: 'Consumer' },
  { id: 'A05', name: 'Renewable power', expectedReturn: 8.8, risk: 6.1, liquidity: 79, sector: 'Energy' },
  { id: 'A06', name: 'Healthcare services', expectedReturn: 7.9, risk: 4.8, liquidity: 90, sector: 'Healthcare' },
  { id: 'A07', name: 'AI infrastructure', expectedReturn: 13.1, risk: 10.2, liquidity: 75, sector: 'Technology' },
  { id: 'A08', name: 'Retail real estate', expectedReturn: 7.1, risk: 5.5, liquidity: 63, sector: 'Real Estate' },
  { id: 'A09', name: 'Supply-chain finance', expectedReturn: 8.4, risk: 4.1, liquidity: 86, sector: 'Financials' },
  { id: 'A10', name: 'Global transport', expectedReturn: 9.7, risk: 6.7, liquidity: 84, sector: 'Industrials' }
];

export const portfolioScenario: PortfolioScenario = {
  assets: portfolioAssets,
  targetReturn: 8.8,
  maxRisk: 7.0,
  maxAssets: 5,
  minLiquidity: 80
};

export const robotTasks: RobotTask[] = [
  { id: 'R01', station: 'A-01', seamGroup: 'door-inner', processingMinutes: 18, changeoverMinutes: 3, priority: 4 },
  { id: 'R02', station: 'A-04', seamGroup: 'roof', processingMinutes: 24, changeoverMinutes: 4, priority: 5 },
  { id: 'R03', station: 'B-02', seamGroup: 'hood', processingMinutes: 16, changeoverMinutes: 3, priority: 3 },
  { id: 'R04', station: 'B-07', seamGroup: 'rear-door', processingMinutes: 20, changeoverMinutes: 3, priority: 4 },
  { id: 'R05', station: 'C-01', seamGroup: 'floor', processingMinutes: 28, changeoverMinutes: 5, priority: 5 },
  { id: 'R06', station: 'C-03', seamGroup: 'trunk', processingMinutes: 19, changeoverMinutes: 4, priority: 3 },
  { id: 'R07', station: 'D-05', seamGroup: 'door-inner', processingMinutes: 21, changeoverMinutes: 3, priority: 5 },
  { id: 'R08', station: 'D-08', seamGroup: 'roof', processingMinutes: 26, changeoverMinutes: 4, priority: 4 },
  { id: 'R09', station: 'E-02', seamGroup: 'front-frame', processingMinutes: 22, changeoverMinutes: 4, priority: 4 },
  { id: 'R10', station: 'E-06', seamGroup: 'rear-frame', processingMinutes: 17, changeoverMinutes: 3, priority: 3 },
  { id: 'R11', station: 'F-02', seamGroup: 'door-inner', processingMinutes: 23, changeoverMinutes: 4, priority: 5 },
  { id: 'R12', station: 'F-07', seamGroup: 'floor', processingMinutes: 27, changeoverMinutes: 5, priority: 4 }
];

export const robotScenario: RobotScenario = {
  tasks: robotTasks,
  robots: 3,
  shiftMinutes: 180,
  maxTravelMeters: 1500,
  valuePerMinuteSaved: 240
};

export const useCases: OptimizationProblem[] = [
  {
    id: 'delivery-network', name: 'Next-day delivery network', domain: 'delivery',
    description: 'Assign delivery work across stations and vehicles while balancing distance, time, capacity, and service promises.',
    objective: 'Minimize route operating cost + service penalties', direction: 'minimize', scale: 9, variables: 24,
    constraints: sharedConstraints,
    assumptions: assumptions([
      ['speed', 'Average speed', 42, 'km/h'], ['service', 'Value per on-time stop', 18, 'USD'], ['distance', 'Value per km avoided', 2.2, 'USD']
    ]), tags: ['routing', 'middle-mile', 'delivery', 'RKO', 'QUBO']
  },
  {
    id: 'workforce-rostering', name: 'Workforce rostering', domain: 'workforce',
    description: 'Assign qualified workers to shifts with coverage guarantees and controllable labor cost.',
    objective: 'Minimize staffing cost + uncovered-shift penalties', direction: 'minimize', scale: 8, variables: 32,
    constraints: sharedConstraints,
    assumptions: assumptions([
      ['ot', 'Overtime multiplier', 1.5, 'x'], ['unfilled', 'Unfilled shift penalty', 450, 'USD']
    ]), tags: ['rostering', 'assignment', 'healthcare', 'scenario-analysis']
  },
  {
    id: 'portfolio-allocation', name: 'Diversified portfolio selection', domain: 'portfolio',
    description: 'Select a bounded set of assets subject to return, risk, liquidity, and diversification policies.',
    objective: 'Maximize expected return under policy constraints', direction: 'maximize', scale: 7, variables: 20,
    constraints: sharedConstraints,
    assumptions: assumptions([
      ['return', 'Target return', 8.8, '%'], ['risk', 'Maximum risk', 7.0, '%'], ['assets', 'Maximum holdings', 5, 'assets']
    ]), tags: ['portfolio', 'selection', 'risk', 'finance', 'QUBO']
  },
  {
    id: 'robot-motion', name: 'Robot seam-path planning', domain: 'robotics',
    description: 'Sequence manufacturing tasks across robot resources to reduce makespan and protect throughput.',
    objective: 'Minimize makespan + overload + changeover friction', direction: 'minimize', scale: 9, variables: 30,
    constraints: sharedConstraints,
    assumptions: assumptions([
      ['robots', 'Robot cells', 3, 'robots'], ['shift', 'Shift budget', 180, 'min'], ['value', 'Value per minute saved', 240, 'USD']
    ]), tags: ['robotics', 'manufacturing', 'RKO', 'scheduling']
  }
];

export const brief: BusinessBrief = {
  headline: 'From quantum buzzword to measurable operational experiment.',
  subhead: 'A mobile decision lab for problems where millions of possible combinations hide operational value.',
  impact: 'The product is designed to make optimization explainable to an operations leader, while keeping the quantum experiment technically honest.',
  whyItMatters: [
    'Every scenario has a classical baseline.',
    'Every “quantum” path exposes its mathematical model and assumptions.',
    'Every result is translated into business metrics, not just objective-function scores.'
  ],
  demoNarrative: [
    'Pick a real problem: next-day delivery, rostering, portfolio selection, or robot planning.',
    'Run the classical benchmark in seconds on-device.',
    'Inspect the QUBO structure and quantum-readiness assessment.',
    'Compare scenarios and export a compact experiment brief for technical review.'
  ]
};
