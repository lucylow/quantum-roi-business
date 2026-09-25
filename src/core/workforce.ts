import type { Decision, Metric, OptimizationProblem, SolverTrace, WorkforceScenario, Worker, Shift } from '../domain';
import { randomKeyOptimize } from './rko';
import { mean } from './math';

export interface WorkforceSolution {
  decisions: Decision[];
  metrics: Metric[];
  trace: SolverTrace[];
  objective: number;
  baselineObjective: number;
  violations: string[];
}

function canCover(worker: Worker, shift: Shift): boolean {
  return worker.role === shift.requiredRole || worker.skills.includes(shift.requiredRole);
}

function shiftCost(worker: Worker, shift: Shift, overtimeMultiplier: number): number {
  const hours = Math.max(0, shift.endHour - shift.startHour);
  const overnight = shift.startHour > shift.endHour ? (24 - shift.startHour) + shift.endHour : 0;
  const effectiveHours = hours || overnight;
  return worker.hourlyCost * effectiveHours * overtimeMultiplier;
}

export function optimizeWorkforce(problem: OptimizationProblem, scenario: WorkforceScenario, seed: number, iterations: number): WorkforceSolution {
  const shiftCount = scenario.shifts.length;
  const workerCount = scenario.workers.length;
  const initial = Array.from({ length: shiftCount }, (_, i) => (i % workerCount) / Math.max(1, workerCount - 1));

  const decode = (keys: number[]): number[] => keys.map((key) => Math.min(workerCount - 1, Math.floor(key * workerCount)));

  const objective = (assignment: number[]) => {
    let cost = 0;
    let uncovered = 0;
    assignment.forEach((workerIndex, shiftIndex) => {
      const worker = scenario.workers[workerIndex];
      const shift = scenario.shifts[shiftIndex];
      if (!canCover(worker, shift)) uncovered += 1;
      cost += canCover(worker, shift) ? shiftCost(worker, shift, 1) : scenario.unfilledShiftPenalty;
    });
    const usedCounts = new Map<number, number>();
    assignment.forEach((value) => usedCounts.set(value, (usedCounts.get(value) ?? 0) + 1));
    usedCounts.forEach((count, workerIndex) => {
      if (count > 1) cost += (count - 1) * scenario.workers[workerIndex].hourlyCost * 0.25;
    });
    return cost + uncovered * scenario.unfilledShiftPenalty;
  };

  const rko = randomKeyOptimize({
    dimensions: Math.max(1, shiftCount),
    populationSize: 20,
    iterations: Math.max(10, iterations),
    seed,
    decoder: decode,
    fitness: objective
  });

  const assignment = rko.decision;
  const baselineAssignment = initial.map((key) => Math.min(workerCount - 1, Math.floor(key * workerCount)));
  const baselineObjective = objective(baselineAssignment);
  const totalObjective = objective(assignment);
  const uncovered = assignment.filter((workerIndex, shiftIndex) => !canCover(scenario.workers[workerIndex], scenario.shifts[shiftIndex])).length;
  const covered = shiftCount - uncovered;
  const laborHours = assignment.reduce((hours, workerIndex, shiftIndex) => {
    const shift = scenario.shifts[shiftIndex];
    return hours + Math.max(0, shift.endHour - shift.startHour);
  }, 0);

  const decisions = assignment.map((workerIndex, shiftIndex) => {
    const worker = scenario.workers[workerIndex];
    const shift = scenario.shifts[shiftIndex];
    const feasible = canCover(worker, shift);
    return {
      id: shift.id,
      label: `${shift.label} → ${worker.name}`,
      selected: feasible,
      score: feasible ? 1 : 0,
      metadata: { worker: worker.name, role: worker.role, requiredRole: shift.requiredRole, demand: shift.demand }
    };
  });

  const metrics: Metric[] = [
    { id: 'staff-cost', label: 'Staffing cost', value: totalObjective, unit: 'USD', direction: 'minimize', baseline: baselineObjective, improvement: ((baselineObjective - totalObjective) / Math.max(1, baselineObjective)) * 100 },
    { id: 'coverage', label: 'Shift coverage', value: (covered / Math.max(1, shiftCount)) * 100, unit: '%', direction: 'maximize', baseline: ((shiftCount - baselineAssignment.filter((w, i) => !canCover(scenario.workers[w], scenario.shifts[i])).length) / Math.max(1, shiftCount)) * 100 },
    { id: 'labor-hours', label: 'Scheduled labor', value: laborHours, unit: 'hours', direction: 'minimize' },
    { id: 'worker-load', label: 'Avg. shifts / worker', value: mean(assignment.map((_, i) => assignment.filter((w) => w === i).length)), unit: 'shifts', direction: 'minimize' }
  ];

  return {
    decisions,
    metrics,
    trace: rko.trace,
    objective: totalObjective,
    baselineObjective,
    violations: uncovered ? [`${uncovered} shifts remain uncovered or skill-incompatible.`] : [],
  };
}
