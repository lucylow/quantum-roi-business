export type CaseStatus = 'Active' | 'Review' | 'Ready' | 'Draft' | 'Archived';
export type RunStatus = 'Completed' | 'Running' | 'Needs review' | 'Failed' | 'Prepared';
export type Industry = 'Logistics' | 'Finance' | 'Workforce' | 'Manufacturing' | 'Energy' | 'Marketing' | 'Healthcare';

export interface EnterpriseCase {
  id: string;
  name: string;
  industry: Industry;
  owner: string;
  status: CaseStatus;
  value: number;
  baseline: number;
  optimized: number;
  variables: number;
  constraints: number;
  confidence: 'High' | 'Medium' | 'Low';
  description: string;
  tags: string[];
}

export interface EnterpriseRun {
  id: string;
  caseId: string;
  caseName: string;
  solver: string;
  status: RunStatus;
  variables: number;
  constraints: number;
  baseline: number;
  objective: number;
  runtime: string;
  date: string;
  feasibility: number;
  notes: string;
}

export const enterpriseCases: EnterpriseCase[] = [
  { id:'CASE-001', name:'Middle-mile delivery network', industry:'Logistics', owner:'Network Optimization', status:'Active', value:18.4, baseline:126.8, optimized:109.7, variables:142, constraints:37, confidence:'Medium', description:'Reduce network operating cost while expanding next-day delivery coverage.', tags:['routing','middle-mile','capacity','RKO'] },
  { id:'CASE-002', name:'Workforce rostering', industry:'Workforce', owner:'Operations Science', status:'Review', value:12.7, baseline:31.7, optimized:29.9, variables:320, constraints:84, confidence:'High', description:'Schedule qualified labor against coverage demand with overtime controls.', tags:['rostering','coverage','skills','CP'] },
  { id:'CASE-003', name:'Diversified portfolio selection', industry:'Finance', owner:'Treasury Analytics', status:'Ready', value:9.6, baseline:7.8, optimized:12.8, variables:48, constraints:22, confidence:'Medium', description:'Select a bounded asset mix under return, risk, liquidity, and concentration policies.', tags:['portfolio','risk','liquidity','QUBO'] },
  { id:'CASE-004', name:'Robot seam-path planning', industry:'Manufacturing', owner:'Manufacturing Engineering', status:'Active', value:7.2, baseline:211, optimized:186, variables:184, constraints:61, confidence:'Medium', description:'Sequence robot seam tasks to reduce makespan and changeover friction.', tags:['robotics','seams','RKO','scheduling'] },
  { id:'CASE-005', name:'Energy unit commitment', industry:'Energy', owner:'Grid Optimization', status:'Draft', value:15.1, baseline:84.1, optimized:74.9, variables:512, constraints:126, confidence:'Low', description:'Coordinate generation assets against demand and reserve constraints.', tags:['energy','dispatch','reserve','MILP'] },
  { id:'CASE-006', name:'Ad inventory allocation', industry:'Marketing', owner:'Yield Science', status:'Ready', value:6.4, baseline:41.2, optimized:48.9, variables:96, constraints:31, confidence:'Medium', description:'Allocate constrained ad inventory across channels to maximize modeled yield.', tags:['ads','allocation','yield','QUBO'] },
  { id:'CASE-007', name:'Clinical trial enrollment', industry:'Healthcare', owner:'Trial Operations', status:'Review', value:11.8, baseline:15.7, optimized:11.9, variables:180, constraints:73, confidence:'Medium', description:'Balance site capacity, geography, enrollment timing, and eligibility requirements.', tags:['sites','enrollment','constraints','scenario'] },
  { id:'CASE-008', name:'Regional vehicle routing', industry:'Logistics', owner:'Fleet Strategy', status:'Active', value:5.3, baseline:21.9, optimized:18.6, variables:88, constraints:24, confidence:'High', description:'Assign customer clusters to vehicles while protecting service windows.', tags:['VRP','fleet','service','RKO'] },
  { id:'CASE-009', name:'Factory line sequencing', industry:'Manufacturing', owner:'Factory Systems', status:'Ready', value:8.1, baseline:93.4, optimized:87.6, variables:224, constraints:67, confidence:'Medium', description:'Sequence jobs to reduce setup time and stabilize throughput.', tags:['sequencing','setup','throughput','annealing'] },
  { id:'CASE-010', name:'Airport gate assignment', industry:'Logistics', owner:'Airport Operations', status:'Draft', value:4.9, baseline:26.3, optimized:23.8, variables:136, constraints:48, confidence:'Low', description:'Assign aircraft to gates while minimizing conflicts and passenger walking distance.', tags:['gates','aircraft','schedule','CP'] },
  { id:'CASE-011', name:'Reinsurance capital allocation', industry:'Finance', owner:'Risk Strategy', status:'Review', value:13.2, baseline:10.3, optimized:15.7, variables:76, constraints:29, confidence:'Low', description:'Allocate capital across exposure bands under portfolio risk constraints.', tags:['reinsurance','capital','risk','selection'] },
  { id:'CASE-012', name:'Warehouse slotting', industry:'Logistics', owner:'Fulfillment Systems', status:'Active', value:6.9, baseline:44.8, optimized:39.2, variables:156, constraints:42, confidence:'High', description:'Place inventory to reduce travel while honoring storage and product constraints.', tags:['warehouse','slotting','pick-path','RKO'] },
  { id:'CASE-013', name:'Sports venue scheduling', industry:'Marketing', owner:'Event Operations', status:'Draft', value:2.1, baseline:12.6, optimized:10.8, variables:108, constraints:39, confidence:'Medium', description:'Coordinate venue capacity, event windows, travel, and broadcast commitments.', tags:['schedule','venue','travel','CP'] },
  { id:'CASE-014', name:'Data-center workload placement', industry:'Energy', owner:'Cloud Efficiency', status:'Ready', value:10.7, baseline:28.9, optimized:24.1, variables:264, constraints:59, confidence:'Medium', description:'Place compute workloads under energy, latency, capacity, and resiliency policies.', tags:['compute','energy','latency','allocation'] },
  { id:'CASE-015', name:'Procurement supplier allocation', industry:'Finance', owner:'Strategic Sourcing', status:'Ready', value:5.8, baseline:62.4, optimized:57.9, variables:116, constraints:41, confidence:'High', description:'Allocate procurement volume across suppliers with continuity and price constraints.', tags:['procurement','suppliers','cost','risk'] },
  { id:'CASE-016', name:'Maintenance window scheduling', industry:'Manufacturing', owner:'Asset Reliability', status:'Review', value:4.4, baseline:18.2, optimized:15.6, variables:95, constraints:36, confidence:'High', description:'Schedule maintenance activities without disrupting critical production windows.', tags:['maintenance','assets','downtime','schedule'] },
  { id:'CASE-017', name:'Distribution station capacity', industry:'Logistics', owner:'Regional Operations', status:'Active', value:8.8, baseline:69.2, optimized:61.5, variables:124, constraints:34, confidence:'Medium', description:'Balance package flows across delivery stations under capacity and service requirements.', tags:['capacity','stations','delivery','flow'] },
  { id:'CASE-018', name:'Customer support staffing', industry:'Workforce', owner:'CX Operations', status:'Ready', value:3.9, baseline:14.9, optimized:13.7, variables:212, constraints:71, confidence:'High', description:'Staff support queues while maintaining coverage and skill requirements.', tags:['staffing','queues','skills','coverage'] },
];

export const enterpriseRuns: EnterpriseRun[] = [
  { id:'QX-1048', caseId:'CASE-001', caseName:'Middle-mile delivery network', solver:'RKO', status:'Completed', variables:142, constraints:37, baseline:126.8, objective:109.7, runtime:'48s', date:'Sep 25, 2026', feasibility:98, notes:'Feasible route plan with improved modeled cost and service coverage.' },
  { id:'QX-1047', caseId:'CASE-003', caseName:'Diversified portfolio selection', solver:'QUBO formulation', status:'Prepared', variables:48, constraints:22, baseline:7.8, objective:12.8, runtime:'—', date:'Sep 25, 2026', feasibility:96, notes:'Reduced formulation generated; no live QPU submission.' },
  { id:'QX-1046', caseId:'CASE-004', caseName:'Robot seam-path planning', solver:'Simulated annealing', status:'Completed', variables:184, constraints:61, baseline:211, objective:186, runtime:'1m 42s', date:'Sep 24, 2026', feasibility:97, notes:'Makespan reduced in synthetic manufacturing scenario.' },
  { id:'QX-1045', caseId:'CASE-002', caseName:'Workforce rostering', solver:'RKO', status:'Needs review', variables:320, constraints:84, baseline:31.7, objective:29.9, runtime:'54s', date:'Sep 24, 2026', feasibility:94, notes:'Coverage is feasible; overtime assumption needs review.' },
  { id:'QX-1044', caseId:'CASE-005', caseName:'Energy unit commitment', solver:'Classical benchmark', status:'Completed', variables:512, constraints:126, baseline:84.1, objective:74.9, runtime:'3m 18s', date:'Sep 23, 2026', feasibility:99, notes:'Classical reference solution established for future hybrid study.' },
  { id:'QX-1043', caseId:'CASE-008', caseName:'Regional vehicle routing', solver:'Greedy', status:'Completed', variables:88, constraints:24, baseline:21.9, objective:18.6, runtime:'12s', date:'Sep 23, 2026', feasibility:99, notes:'Useful quick benchmark; not the primary optimizer.' },
  { id:'QX-1042', caseId:'CASE-012', caseName:'Warehouse slotting', solver:'RKO', status:'Running', variables:156, constraints:42, baseline:44.8, objective:39.2, runtime:'—', date:'Sep 25, 2026', feasibility:91, notes:'Optimization in progress.' },
  { id:'QX-1041', caseId:'CASE-007', caseName:'Clinical trial enrollment', solver:'Constraint programming', status:'Completed', variables:180, constraints:73, baseline:15.7, objective:11.9, runtime:'2m 16s', date:'Sep 22, 2026', feasibility:95, notes:'Enrollment timeline improved under capacity constraints.' },
  { id:'QX-1040', caseId:'CASE-011', caseName:'Reinsurance capital allocation', solver:'QUBO formulation', status:'Prepared', variables:76, constraints:29, baseline:10.3, objective:15.7, runtime:'—', date:'Sep 21, 2026', feasibility:93, notes:'Candidate formulation pending technical review.' },
  { id:'QX-1039', caseId:'CASE-009', caseName:'Factory line sequencing', solver:'Simulated annealing', status:'Completed', variables:224, constraints:67, baseline:93.4, objective:87.6, runtime:'2m 04s', date:'Sep 20, 2026', feasibility:98, notes:'Setup time reduced while preserving production order constraints.' },
];

export const activity = [
  { time:'12:42', tone:'cyan' as const, title:'Middle-mile scenario completed', detail:'RKO benchmark · QX-1048' },
  { time:'11:18', tone:'violet' as const, title:'Portfolio QUBO prepared', detail:'48-variable reduced model' },
  { time:'10:04', tone:'green' as const, title:'Rostering assumptions updated', detail:'Overtime multiplier 1.5×' },
  { time:'09:37', tone:'blue' as const, title:'Robot experiment completed', detail:'Makespan benchmark · QX-1046' },
  { time:'08:16', tone:'amber' as const, title:'Scenario report generated', detail:'Quarterly optimization portfolio' },
  { time:'Yesterday', tone:'red' as const, title:'Constraint conflict detected', detail:'Energy reserve margin scenario' },
];

export const notifications = [
  { id:'N1', title:'Optimization run completed', detail:'Middle-mile delivery network', time:'12:42', tone:'cyan' as const },
  { id:'N2', title:'Scenario requires review', detail:'Workforce rostering', time:'11:18', tone:'amber' as const },
  { id:'N3', title:'Experiment preparation complete', detail:'Portfolio QUBO', time:'10:51', tone:'violet' as const },
  { id:'N4', title:'Constraint conflict detected', detail:'Energy unit commitment', time:'09:47', tone:'red' as const },
  { id:'N5', title:'Report ready', detail:'Optimization portfolio', time:'Yesterday', tone:'green' as const },
];

export const portfolioHoldings = [
  { ticker:'AIIF', sector:'Technology', allocation:18.2, expectedReturn:13.1, risk:10.2 },
  { ticker:'LSI', sector:'Infrastructure', allocation:21.7, expectedReturn:9.2, risk:5.8 },
  { ticker:'IAC', sector:'Industrials', allocation:17.5, expectedReturn:10.6, risk:6.9 },
  { ticker:'HCS', sector:'Healthcare', allocation:14.6, expectedReturn:7.9, risk:4.8 },
  { ticker:'SCF', sector:'Financials', allocation:12.4, expectedReturn:8.4, risk:4.1 },
  { ticker:'RPP', sector:'Energy', allocation:9.8, expectedReturn:8.8, risk:6.1 },
  { ticker:'Cash', sector:'Liquidity', allocation:5.8, expectedReturn:2.0, risk:0.5 },
];

export const scenarioSets = [
  { id:'conservative', name:'Conservative', badge:'LOWER RISK', optimization:6, adoption:50, implementation:18, risk:'High', value:9.2 },
  { id:'base', name:'Base', badge:'MOST LIKELY', optimization:12, adoption:75, implementation:12, risk:'Medium', value:14.6 },
  { id:'expansion', name:'Expansion', badge:'HIGHER REWARD', optimization:18, adoption:90, implementation:9, risk:'Low', value:23.9 },
];

export const sensitivity = [
  { label:'Optimization improvement', impact:41, baseline:'12%', range:'6% → 18%' },
  { label:'Adoption rate', impact:28, baseline:'75%', range:'50% → 90%' },
  { label:'Implementation cost', impact:16, baseline:'$3.8M', range:'$2.4M → $6.1M' },
  { label:'Time to value', impact:9, baseline:'12 mo', range:'9 → 18 mo' },
  { label:'Operating cost', impact:6, baseline:'$109.7M', range:'$104M → $118M' },
  { label:'Data preparation', impact:3, baseline:'6 mo', range:'3 → 9 mo' },
];

export const metrics = {
  activeOpportunities: 12,
  modeledAnnualValue: 42.8,
  optimizationRuns: 184,
  quantumReady: 7,
  experiments: 23,
  costReduction: 17.1,
  investment: 3.8,
  netValue: 14.6,
};

export const qpuMockDevices = [
  { name:'Managed simulator', provider:'Simulator', qubits:'—', status:'Available', reason:'Best starting point for validation' },
  { name:'Neutral atom experiment', provider:'Analog device', qubits:'256', status:'Research', reason:'Useful for reduced graph experiments' },
  { name:'Superconducting experiment', provider:'QPU', qubits:'82', status:'Research', reason:'Evaluate only after classical benchmark' },
  { name:'Ion-trap experiment', provider:'QPU', qubits:'36', status:'Research', reason:'Small reduced kernels only' },
];

export const evidence = [
  { id:'EV-001', title:'Baseline data snapshot', status:'Complete', detail:'Synthetic network sample · 8,420 records' },
  { id:'EV-002', title:'Constraint specification', status:'Complete', detail:'37 constraints · hard and soft policies' },
  { id:'EV-003', title:'Classical benchmark', status:'Complete', detail:'RKO reference solution · 48s' },
  { id:'EV-004', title:'QUBO formulation', status:'Reviewed', detail:'64-variable reduced kernel' },
  { id:'EV-005', title:'Scenario analysis', status:'Complete', detail:'3 scenarios · 6 sensitivity drivers' },
];

export const dataLabels = [
  'Synthetic network sample','Synthetic workforce roster','Synthetic portfolio universe','Synthetic robot cell schedule',
  'Synthetic energy demand profile','Synthetic ad inventory','Synthetic trial-site capacity','Synthetic procurement ledger',
];
