import { Share } from 'react-native';
import type { OptimizationResult } from '../domain';
import type { AuditRecord } from '../core/audit';

function finite(value: number | undefined, fallback = 0): number {
  return Number.isFinite(value) ? Number(value) : fallback;
}

export async function shareExperimentBrief(args: {
  title: string;
  domain: string;
  result: OptimizationResult;
  audit?: AuditRecord | null;
}): Promise<{ dismissed?: boolean }> {
  const { title, domain, result, audit } = args;
  const baseline = finite(result.baselineObjective);
  const objective = finite(result.objective);
  const improvement = baseline === 0 ? 0 : ((baseline - objective) / Math.abs(baseline)) * 100;
  const message = [
    `Quantum ROI Business — ${title}`,
    '',
    `Problem: ${domain}`,
    `Solver: ${result.solver}`,
    `Best objective: ${finite(result.objective).toFixed(2)}`,
    `Baseline objective: ${finite(result.baselineObjective).toFixed(2)}`,
    `Improvement: ${improvement.toFixed(1)}%`,
    `Feasibility: ${result.violations.length === 0 ? 'PASS' : 'REVIEW'}`,
    '',
    'Decision record:',
    'Use classical optimization as the benchmark, expose constraints and assumptions, and escalate to quantum hardware only when the experiment is justified.',
    ...(audit ? ['', `Model hash: ${audit.modelHash}`, `Input hash: ${audit.inputHash}`, `Result hash: ${audit.resultHash}`, `Seed: ${audit.seed}`] : []),
  ].join('\n');

  try {
    const result = await Share.share({ title, message });
    return { dismissed: result.action === Share.dismissedAction };
  } catch (error) {
    throw error instanceof Error ? error : new Error('The system share sheet could not be opened.');
  }
}
