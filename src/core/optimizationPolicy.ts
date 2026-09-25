export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  severity: 'blocker' | 'warning' | 'info';
  validate: (context: PolicyContext) => string | null;
}

export interface PolicyContext {
  logicalVariables: number;
  interactions: number;
  quantumRequested: boolean;
  liveBackend: boolean;
  hasBaseline: boolean;
  hasViolations: boolean;
  estimatedCostUsd: number;
}

export const defaultPolicyRules: PolicyRule[] = [
  { id: 'baseline-required', name: 'Classical baseline required', description: 'Every benchmark needs a classical comparison.', severity: 'blocker', validate: c => c.hasBaseline ? null : 'No classical baseline is attached to the experiment.' },
  { id: 'quantum-size', name: 'Quantum size check', description: 'Large models must be reduced before an exploratory QPU submission.', severity: 'warning', validate: c => c.logicalVariables <= 40 ? null : 'Model exceeds the default exploratory quantum-size threshold.' },
  { id: 'violations', name: 'Feasibility check', description: 'Do not present an infeasible result as production-ready.', severity: 'blocker', validate: c => c.hasViolations ? 'Returned result contains constraint violations.' : null },
  { id: 'live-gate', name: 'Live backend explicit gate', description: 'Cloud execution requires explicit operator action.', severity: 'blocker', validate: c => c.liveBackend && !c.quantumRequested ? 'Live backend is enabled without explicit quantum experiment intent.' : null },
  { id: 'cost', name: 'Spend guardrail', description: 'Experiments should surface approximate cloud spend before execution.', severity: 'warning', validate: c => c.estimatedCostUsd <= 25 ? null : 'Estimated experiment cost exceeds the demo safety threshold.' },
  { id: 'interaction-density', name: 'Interaction-density notice', description: 'Dense models may have higher embedding overhead.', severity: 'info', validate: c => c.interactions <= c.logicalVariables * 3 ? null : 'Interaction graph is dense relative to model size.' }
];

export function evaluatePolicy(context: PolicyContext, rules = defaultPolicyRules) {
  return rules.map((rule) => ({ rule, violation: rule.validate(context) })).filter((row) => row.violation);
}

export function policyBlocks(context: PolicyContext): boolean { return evaluatePolicy(context).some(x => x.rule.severity === 'blocker'); }
export function policyMessages(context: PolicyContext): string[] { return evaluatePolicy(context).map(x => `${x.rule.severity.toUpperCase()}: ${x.violation}`); }

export function estimateExperimentCost(shots: number, seconds: number, deviceClass: 'simulator' | 'QPU'): number {
  const base = deviceClass === 'simulator' ? 0.05 : 0.5;
  return Number((base + shots * 0.00002 + seconds * 0.01).toFixed(4));
}
