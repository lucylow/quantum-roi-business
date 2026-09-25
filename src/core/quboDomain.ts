import type { OptimizationProblem, OptimizationInput, QuboModel } from '../domain';
import { addAtMostOne, addExactlyOne, addLinear, createEmptyQubo } from './qubo';

export function buildDomainQubo(problem: OptimizationProblem, scenarioData: OptimizationInput['scenarioData']): QuboModel {
  switch (problem.domain) {
    case 'portfolio': {
      const assets = (scenarioData as any).assets as Array<{ id: string; expectedReturn: number; risk: number; sector: string }>;
      const model = createEmptyQubo(assets.length, assets.map((a) => a.id));
      assets.forEach((asset, index) => addLinear(model, index, -asset.expectedReturn + asset.risk * 0.45));
      addAtMostOne(model, assets.map((_, i) => i), 0.05, 'Asset selection');
      model.constraints.push('Portfolio cap: select at most the configured number of assets.');
      return model;
    }
    case 'workforce': {
      const data = scenarioData as any;
      const shifts = data.shifts as Array<{ id: string }>;
      const workers = data.workers as Array<{ id: string }>;
      const n = shifts.length * Math.min(workers.length, 8);
      const labels = Array.from({ length: n }, (_, i) => `${shifts[i % shifts.length].id}_${workers[Math.floor(i / shifts.length) % workers.length].id}`);
      const model = createEmptyQubo(n, labels);
      for (let s = 0; s < shifts.length; s += 1) {
        const indices = workers.slice(0, Math.min(8, workers.length)).map((_, w) => s + w * shifts.length);
        addExactlyOne(model, indices, 8, `Shift ${shifts[s].id}`);
      }
      return model;
    }
    case 'delivery': {
      const data = scenarioData as any;
      const stops = (data.stops as Array<any>).filter((s) => s.type !== 'warehouse');
      const n = Math.min(40, Math.max(4, stops.length * data.vehicles.length));
      const labels = Array.from({ length: n }, (_, i) => `stop_${i % stops.length}_vehicle_${Math.floor(i / stops.length)}`);
      const model = createEmptyQubo(n, labels);
      for (let i = 0; i < stops.length; i += 1) {
        const candidates: number[] = (data.vehicles as unknown[]).map((_, v) => (i + v * stops.length) % n);
        addExactlyOne(model, [...new Set(candidates)], 5, `Stop ${stops[i].id}`);
      }
      return model;
    }
    case 'robotics': {
      const data = scenarioData as any;
      const tasks = data.tasks as Array<any>;
      const n = Math.min(48, Math.max(4, tasks.length * data.robots));
      const labels = Array.from({ length: n }, (_, i) => `task_${i % tasks.length}_robot_${Math.floor(i / tasks.length)}`);
      const model = createEmptyQubo(n, labels);
      for (let i = 0; i < tasks.length; i += 1) {
        const candidates = Array.from({ length: data.robots }, (_, r) => (i + r * tasks.length) % n);
        addExactlyOne(model, [...new Set(candidates)], 6, `Task ${tasks[i].id}`);
      }
      return model;
    }
    default: {
      return createEmptyQubo(Math.min(30, Math.max(4, problem.variables)), Array.from({ length: problem.variables }, (_, i) => `x${i}`));
    }
  }
}
