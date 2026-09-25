import type {
  DeliveryScenario,
  Decision,
  Metric,
  OptimizationProblem,
  SolverTrace,
  Vehicle
} from '../domain';
import { haversineKm, mean, sumBy } from './math';
import { randomKeyOptimize } from './rko';

export interface DeliverySolution {
  decisions: Decision[];
  metrics: Metric[];
  trace: SolverTrace[];
  objective: number;
  baselineObjective: number;
  violations: string[];
}

interface RoutePlan {
  vehicle: Vehicle;
  stops: string[];
  distanceKm: number;
  minutes: number;
  load: number;
  onTime: number;
  cost: number;
}

function nodeById(scenario: DeliveryScenario, id: string) {
  const node = scenario.stops.find((stop) => stop.id === id);
  if (!node) throw new Error(`Unknown delivery node ${id}`);
  return node;
}

function routeStats(scenario: DeliveryScenario, vehicle: Vehicle, stopIds: string[]): RoutePlan {
  let distanceKm = 0;
  let minutes = 0;
  let load = 0;
  let onTime = 0;
  let previous = nodeById(scenario, vehicle.startNode);
  const horizonStart = 7 * 60;

  for (const id of stopIds) {
    const stop = nodeById(scenario, id);
    const km = haversineKm([previous.lat, previous.lon], [stop.lat, stop.lon]);
    distanceKm += km;
    minutes += (km / scenario.averageSpeedKph) * 60 + stop.serviceMinutes;
    load += stop.demand;
    const arrival = horizonStart + minutes;
    if (arrival >= stop.readyAt && arrival <= stop.dueAt) onTime += 1;
    previous = stop;
  }
  const depot = nodeById(scenario, vehicle.endNode);
  distanceKm += haversineKm([previous.lat, previous.lon], [depot.lat, depot.lon]);
  minutes += (haversineKm([previous.lat, previous.lon], [depot.lat, depot.lon]) / scenario.averageSpeedKph) * 60;
  const cost = vehicle.fixedCost + vehicle.costPerKm * distanceKm;
  return { vehicle, stops: stopIds, distanceKm, minutes, load, onTime, cost };
}

function decodeKeys(keys: number[], scenario: DeliveryScenario): number[] {
  const stopCount = scenario.stops.length - 1;
  const scored = keys.slice(0, stopCount).map((key, index) => ({ key, index }));
  scored.sort((a, b) => a.key - b.key);
  return scored.map((item) => item.index);
}

function buildRoutes(order: number[], scenario: DeliveryScenario): RoutePlan[] {
  const customerStops = scenario.stops.filter((stop) => stop.type !== 'warehouse');
  const routes: RoutePlan[] = [];
  const queues = scenario.vehicles.map(() => [] as string[]);

  order.forEach((position, sequence) => {
    const stop = customerStops[position];
    const vehicleIndex = sequence % scenario.vehicles.length;
    queues[vehicleIndex].push(stop.id);
  });

  scenario.vehicles.forEach((vehicle, index) => {
    routes.push(routeStats(scenario, vehicle, queues[index]));
  });
  return routes;
}

export function optimizeDelivery(problem: OptimizationProblem, scenario: DeliveryScenario, seed: number, iterations: number): DeliverySolution {
  const customerCount = scenario.stops.filter((s) => s.type !== 'warehouse').length;
  const keys = Array.from({ length: Math.max(1, customerCount) }, (_, index) => (index + 1) / (customerCount + 1));
  const baselineRoutes = buildRoutes(Array.from({ length: customerCount }, (_, i) => i), scenario);
  const baselineCost = sumBy(baselineRoutes, (r) => r.cost);
  const baselineLate = customerCount - sumBy(baselineRoutes, (r) => r.onTime);
  const baselineObjective = baselineCost + baselineLate * scenario.routePenalty;

  const rko = randomKeyOptimize({
    dimensions: Math.max(1, customerCount),
    populationSize: Math.max(16, scenario.vehicles.length * 8),
    iterations: Math.max(8, iterations),
    seed,
    decoder: (candidateKeys) => decodeKeys(candidateKeys, scenario),
    fitness: (decision) => {
      const routes = buildRoutes(decision, scenario);
      const late = customerCount - sumBy(routes, (r) => r.onTime);
      const capacityOverflow = sumBy(routes, (r) => Math.max(0, r.load - r.vehicle.capacity));
      const timeOverflow = sumBy(routes, (r) => Math.max(0, r.minutes - r.vehicle.maxRouteMinutes));
      return sumBy(routes, (r) => r.cost) + late * scenario.routePenalty + capacityOverflow * 80 + timeOverflow * 3;
    }
  });

  const routes = buildRoutes(rko.decision, scenario);
  const totalCost = sumBy(routes, (r) => r.cost);
  const onTime = sumBy(routes, (r) => r.onTime);
  const late = customerCount - onTime;
  const distance = sumBy(routes, (r) => r.distanceKm);
  const routeMinutes = sumBy(routes, (r) => r.minutes);
  const capacityViolation = sumBy(routes, (r) => Math.max(0, r.load - r.vehicle.capacity));
  const timeViolation = sumBy(routes, (r) => Math.max(0, r.minutes - r.vehicle.maxRouteMinutes));
  const objective = rko.fitness;

  const decisions = routes.flatMap((route) => route.stops.map((id, index) => ({
    id: `${route.vehicle.id}-${id}`,
    label: `${route.vehicle.label} → ${nodeById(scenario, id).name}`,
    selected: true,
    score: Number((1 - index / Math.max(1, route.stops.length)).toFixed(3)),
    metadata: { vehicle: route.vehicle.label, sequence: index + 1, km: route.distanceKm }
  })));

  const metrics: Metric[] = [
    {
      id: 'delivery-cost', label: 'Route operating cost', value: totalCost, unit: 'USD', direction: 'minimize', baseline: baselineCost,
      improvement: baselineCost === 0 ? 0 : ((baselineCost - totalCost) / baselineCost) * 100
    },
    {
      id: 'distance', label: 'Network distance', value: distance, unit: 'km', direction: 'minimize',
      baseline: sumBy(baselineRoutes, (r) => r.distanceKm), improvement: ((sumBy(baselineRoutes, (r) => r.distanceKm) - distance) / Math.max(1, sumBy(baselineRoutes, (r) => r.distanceKm))) * 100
    },
    {
      id: 'on-time', label: 'On-time stops', value: onTime, unit: 'stops', direction: 'maximize', baseline: customerCount - baselineLate,
      improvement: ((onTime - (customerCount - baselineLate)) / Math.max(1, customerCount)) * 100
    },
    { id: 'route-hours', label: 'Driver time', value: routeMinutes / 60, unit: 'hours', direction: 'minimize', baseline: sumBy(baselineRoutes, (r) => r.minutes) / 60 }
  ];

  const violations: string[] = [];
  if (capacityViolation > 0.01) violations.push(`${capacityViolation.toFixed(1)} demand units exceed vehicle capacity.`);
  if (timeViolation > 0.01) violations.push(`${timeViolation.toFixed(1)} route minutes exceed shift limits.`);

  // Avoid unused warning for the problem parameter while preserving API symmetry.
  void problem;
  void keys;
  return {
    decisions,
    metrics,
    trace: rko.trace,
    objective,
    baselineObjective,
    violations
  };
}
