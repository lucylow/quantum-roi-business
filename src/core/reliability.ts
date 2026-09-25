export interface ReliabilityCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: 'info' | 'warning' | 'blocker';
  detail: string;
}

export interface ReliabilityReport {
  passed: boolean;
  checks: ReliabilityCheck[];
}

export function validateScenarioShape(input: unknown): ReliabilityReport {
  const checks: ReliabilityCheck[] = [];
  const record = input && typeof input === 'object' ? input as Record<string, unknown> : null;
  checks.push({ id: 'input-object', label: 'Input is an object', passed: Boolean(record), severity: 'blocker', detail: record ? 'Input object received.' : 'Expected a structured optimization input.' });
  if (!record) return { passed: false, checks };
  checks.push({ id: 'problem', label: 'Problem exists', passed: Boolean(record.problem), severity: 'blocker', detail: record.problem ? 'Problem payload present.' : 'Missing problem.' });
  checks.push({ id: 'scenario', label: 'Scenario data exists', passed: Boolean(record.scenarioData), severity: 'blocker', detail: record.scenarioData ? 'Scenario data present.' : 'Missing scenarioData.' });
  checks.push({ id: 'seed', label: 'Seed is present', passed: Number.isFinite(record.seed), severity: 'warning', detail: Number.isFinite(record.seed) ? 'Deterministic seed supplied.' : 'Seed missing; reproducibility weakened.' });
  checks.push({ id: 'iterations', label: 'Iteration budget is bounded', passed: typeof record.iterations === 'number' && record.iterations > 0 && record.iterations <= 500, severity: 'blocker', detail: 'Iteration budget must be between 1 and 500.' });
  return { passed: checks.every(c => c.passed || c.severity !== 'blocker'), checks };
}

export function auditResult(result: { status: string; violations: string[]; durationMs: number; solver: string }): ReliabilityReport {
  const checks: ReliabilityCheck[] = [
    { id: 'status', label: 'Run completed', passed: result.status === 'complete' || result.status === 'fallback', severity: 'blocker', detail: `Status: ${result.status}` },
    { id: 'duration', label: 'Runtime recorded', passed: Number.isFinite(result.durationMs), severity: 'warning', detail: `Duration: ${result.durationMs}ms` },
    { id: 'violations', label: 'No feasibility violations', passed: result.violations.length === 0, severity: 'warning', detail: result.violations.length ? `${result.violations.length} violation(s).` : 'No violations.' },
    { id: 'solver-label', label: 'Solver recorded', passed: Boolean(result.solver), severity: 'blocker', detail: `Solver: ${result.solver}` }
  ];
  return { passed: checks.every(c => c.passed || c.severity !== 'blocker'), checks };
}

export function humanizeChecks(report: ReliabilityReport): string[] {
  return report.checks.map((check) => `${check.passed ? 'PASS' : check.severity === 'blocker' ? 'BLOCK' : 'WARN'} · ${check.label} · ${check.detail}`);
}
