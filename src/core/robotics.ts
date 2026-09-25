import type { Decision, Metric, OptimizationProblem, RobotScenario, SolverTrace } from '../domain';
import { randomKeyOptimize } from './rko';
import { seededRandom } from './math';

export interface RobotSolution {
  decisions: Decision[];
  metrics: Metric[];
  trace: SolverTrace[];
  objective: number;
  baselineObjective: number;
  violations: string[];
}

function travelCost(a: string, b: string): number {
  let hash = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) hash = (hash * 31 + (a.charCodeAt(i) || 0) - (b.charCodeAt(i) || 0)) % 100000;
  return 2 + Math.abs(hash % 17);
}

export function optimizeRobotics(problem: OptimizationProblem, scenario: RobotScenario, seed: number, iterations: number): RobotSolution {
  const count = scenario.tasks.length;
  const robotAssignment = (keys: number[]): number[] => keys.map((key) => Math.min(scenario.robots - 1, Math.floor(key * scenario.robots)));

  const objective = (assignment: number[]): number => {
    const loads = Array(scenario.robots).fill(0) as number[];
    const lastStation = Array(scenario.robots).fill('DEPOT') as string[];
    assignment.forEach((robotIndex, taskIndex) => {
      const task = scenario.tasks[taskIndex];
      const change = travelCost(lastStation[robotIndex], task.station);
      loads[robotIndex] += task.processingMinutes + task.changeoverMinutes + change;
      lastStation[robotIndex] = task.station;
    });
    const overload = loads.reduce((sum, load) => sum + Math.max(0, load - scenario.shiftMinutes), 0);
    const balancing = Math.max(...loads) - Math.min(...loads);
    const travel = assignment.reduce((sum, robotIndex, i) => sum + travelCost(lastStation[robotIndex] || 'DEPOT', scenario.tasks[i].station), 0);
    return Math.max(...loads) + overload * 4 + balancing * 0.15 + travel * 0.1;
  };

  const rko = randomKeyOptimize({
    dimensions: Math.max(1, count),
    populationSize: Math.max(18, scenario.robots * 5),
    iterations: Math.max(10, iterations),
    seed,
    decoder: robotAssignment,
    fitness: objective
  });

  const assignment = rko.decision;
  const baseline = robotAssignment(Array.from({ length: count }, (_, i) => i / Math.max(1, count - 1)));
  const objectiveValue = objective(assignment);
  const baselineObjective = objective(baseline);
  const loads = Array(scenario.robots).fill(0) as number[];
  assignment.forEach((robotIndex, taskIndex) => {
    const task = scenario.tasks[taskIndex];
    loads[robotIndex] += task.processingMinutes + task.changeoverMinutes + travelCost('STATION', task.station);
  });
  const makespan = Math.max(...loads);
  const savedMinutes = Math.max(0, scenario.shiftMinutes - makespan);
  const violations = loads.flatMap((load, robot) => load > scenario.shiftMinutes ? [`Robot ${robot + 1} exceeds its shift by ${(load - scenario.shiftMinutes).toFixed(0)} minutes.`] : []);

  const decisions: Decision[] = scenario.tasks.map((task, index) => ({
    id: task.id,
    label: `${task.station} · ${task.seamGroup}`,
    selected: true,
    score: 1 - task.processingMinutes / Math.max(1, scenario.shiftMinutes),
    metadata: { robot: assignment[index] + 1, priority: task.priority, processingMinutes: task.processingMinutes }
  }));

  const metrics: Metric[] = [
    { id: 'makespan', label: 'Estimated makespan', value: makespan, unit: 'min', direction: 'minimize', baseline: Math.max(...(() => { const l = Array(scenario.robots).fill(0) as number[]; baseline.forEach((r, i) => l[r] += scenario.tasks[i].processingMinutes + scenario.tasks[i].changeoverMinutes); return l; })()), improvement: ((baselineObjective - objectiveValue) / Math.max(1, Math.abs(baselineObjective))) * 100 },
    { id: 'minutes-saved', label: 'Shift minutes protected', value: savedMinutes, unit: 'min', direction: 'maximize' },
    { id: 'economic-value', label: 'Estimated operational value', value: savedMinutes * scenario.valuePerMinuteSaved, unit: 'USD', direction: 'maximize' },
    { id: 'balance', label: 'Robot load spread', value: Math.max(...loads) - Math.min(...loads), unit: 'min', direction: 'minimize' }
  ];

  const random = seededRandom(seed);
  void random;
  void problem;
  return { decisions, metrics, trace: rko.trace, objective: objectiveValue, baselineObjective, violations };
}
