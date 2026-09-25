import type {
  Asset,
  DeliveryScenario,
  DeliveryStop,
  OptimizationInput,
  OptimizationProblem,
  PortfolioScenario,
  RobotScenario,
  RobotTask,
  Shift,
  Vehicle,
  WorkforceScenario,
  Worker,
} from '../domain';
import { finiteNumber, positiveNumber } from './safeNumber';

export interface ScenarioValidationIssue {
  path: string;
  severity: 'error' | 'warning';
  message: string;
}

function issue(path: string, message: string, severity: ScenarioValidationIssue['severity'] = 'error'): ScenarioValidationIssue {
  return { path, severity, message };
}

function requireNonEmpty(value: unknown, path: string, label: string, issues: ScenarioValidationIssue[]): void {
  if (typeof value !== 'string' || !value.trim()) issues.push(issue(path, `${label} is required.`));
}

function requireFinite(value: unknown, path: string, label: string, issues: ScenarioValidationIssue[]): void {
  if (!Number.isFinite(Number(value))) issues.push(issue(path, `${label} must be a finite number.`));
}

function requirePositive(value: unknown, path: string, label: string, issues: ScenarioValidationIssue[]): void {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) issues.push(issue(path, `${label} must be greater than zero.`));
}

function requireNonNegative(value: unknown, path: string, label: string, issues: ScenarioValidationIssue[]): void {
  if (!Number.isFinite(Number(value)) || Number(value) < 0) issues.push(issue(path, `${label} cannot be negative.`));
}

function arrayCheck(value: unknown, path: string, label: string, issues: ScenarioValidationIssue[], maxLength: number): value is unknown[] {
  if (!Array.isArray(value)) {
    issues.push(issue(path, `${label} must be an array.`));
    return false;
  }
  if (value.length === 0) issues.push(issue(path, `${label} must contain at least one item.`));
  if (value.length > maxLength) issues.push(issue(path, `${label} cannot contain more than ${maxLength} items.`));
  return true;
}

export function validateDeliveryStop(stop: DeliveryStop, index: number): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  const path = `stops[${index}]`;
  requireNonEmpty(stop.id, `${path}.id`, 'Stop id', issues);
  requireNonEmpty(stop.name, `${path}.name`, 'Stop name', issues);
  requireFinite(stop.lat, `${path}.lat`, 'Latitude', issues);
  requireFinite(stop.lon, `${path}.lon`, 'Longitude', issues);
  if (stop.lat < -90 || stop.lat > 90) issues.push(issue(`${path}.lat`, 'Latitude must be between -90 and 90.'));
  if (stop.lon < -180 || stop.lon > 180) issues.push(issue(`${path}.lon`, 'Longitude must be between -180 and 180.'));
  requireNonNegative(stop.demand, `${path}.demand`, 'Demand', issues);
  requireNonNegative(stop.serviceMinutes, `${path}.serviceMinutes`, 'Service minutes', issues);
  if (stop.readyAt < 0 || stop.dueAt < 0) issues.push(issue(`${path}.window`, 'Service-window times cannot be negative.'));
  if (stop.dueAt < stop.readyAt) issues.push(issue(`${path}.window`, 'Due time cannot be earlier than ready time.'));
  return issues;
}

export function validateVehicle(vehicle: Vehicle, index: number): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  const path = `vehicles[${index}]`;
  requireNonEmpty(vehicle.id, `${path}.id`, 'Vehicle id', issues);
  requireNonEmpty(vehicle.label, `${path}.label`, 'Vehicle label', issues);
  requirePositive(vehicle.capacity, `${path}.capacity`, 'Vehicle capacity', issues);
  requireNonEmpty(vehicle.startNode, `${path}.startNode`, 'Vehicle start node', issues);
  requireNonEmpty(vehicle.endNode, `${path}.endNode`, 'Vehicle end node', issues);
  requirePositive(vehicle.maxRouteMinutes, `${path}.maxRouteMinutes`, 'Maximum route time', issues);
  requireNonNegative(vehicle.fixedCost, `${path}.fixedCost`, 'Fixed vehicle cost', issues);
  requireNonNegative(vehicle.costPerKm, `${path}.costPerKm`, 'Cost per kilometre', issues);
  return issues;
}

export function validateDeliveryScenario(data: DeliveryScenario): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  if (!arrayCheck(data.stops, 'stops', 'Delivery stops', issues, 500)) return issues;
  if (!arrayCheck(data.vehicles, 'vehicles', 'Vehicles', issues, 100)) return issues;
  data.stops.forEach((stop, index) => issues.push(...validateDeliveryStop(stop, index)));
  data.vehicles.forEach((vehicle, index) => issues.push(...validateVehicle(vehicle, index)));
  requirePositive(data.averageSpeedKph, 'averageSpeedKph', 'Average speed', issues);
  requireNonNegative(data.valuePerOnTimeStop, 'valuePerOnTimeStop', 'Value per on-time stop', issues);
  requireNonNegative(data.valuePerKmAvoided, 'valuePerKmAvoided', 'Value per kilometre avoided', issues);
  requireNonNegative(data.routePenalty, 'routePenalty', 'Route penalty', issues);
  const ids = new Set<string>();
  data.stops.forEach((stop, index) => {
    if (ids.has(stop.id)) issues.push(issue(`stops[${index}].id`, `Duplicate stop id: ${stop.id}.`));
    ids.add(stop.id);
  });
  return issues;
}

export function validateWorker(worker: Worker, index: number): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  const path = `workers[${index}]`;
  requireNonEmpty(worker.id, `${path}.id`, 'Worker id', issues);
  requireNonEmpty(worker.name, `${path}.name`, 'Worker name', issues);
  requireNonEmpty(worker.role, `${path}.role`, 'Worker role', issues);
  if (!Array.isArray(worker.skills)) issues.push(issue(`${path}.skills`, 'Skills must be an array.'));
  requireNonNegative(worker.hourlyCost, `${path}.hourlyCost`, 'Hourly cost', issues);
  return issues;
}

export function validateShift(shift: Shift, index: number): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  const path = `shifts[${index}]`;
  requireNonEmpty(shift.id, `${path}.id`, 'Shift id', issues);
  requireNonEmpty(shift.label, `${path}.label`, 'Shift label', issues);
  requireNonEmpty(shift.requiredRole, `${path}.requiredRole`, 'Required role', issues);
  requireNonNegative(shift.startHour, `${path}.startHour`, 'Start hour', issues);
  requireNonNegative(shift.endHour, `${path}.endHour`, 'End hour', issues);
  if (shift.endHour <= shift.startHour) issues.push(issue(`${path}.hours`, 'Shift end time must be after start time.'));
  requirePositive(shift.demand, `${path}.demand`, 'Shift demand', issues);
  return issues;
}

export function validateWorkforceScenario(data: WorkforceScenario): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  if (!arrayCheck(data.workers, 'workers', 'Workers', issues, 1_000)) return issues;
  if (!arrayCheck(data.shifts, 'shifts', 'Shifts', issues, 1_000)) return issues;
  data.workers.forEach((worker, index) => issues.push(...validateWorker(worker, index)));
  data.shifts.forEach((shift, index) => issues.push(...validateShift(shift, index)));
  if (data.overtimeMultiplier < 1) issues.push(issue('overtimeMultiplier', 'Overtime multiplier should be at least 1.', 'warning'));
  requirePositive(data.overtimeMultiplier, 'overtimeMultiplier', 'Overtime multiplier', issues);
  requireNonNegative(data.unfilledShiftPenalty, 'unfilledShiftPenalty', 'Unfilled-shift penalty', issues);
  return issues;
}

export function validateAsset(asset: Asset, index: number): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  const path = `assets[${index}]`;
  requireNonEmpty(asset.id, `${path}.id`, 'Asset id', issues);
  requireNonEmpty(asset.name, `${path}.name`, 'Asset name', issues);
  requireFinite(asset.expectedReturn, `${path}.expectedReturn`, 'Expected return', issues);
  requireNonNegative(asset.risk, `${path}.risk`, 'Risk', issues);
  requireNonNegative(asset.liquidity, `${path}.liquidity`, 'Liquidity', issues);
  requireNonEmpty(asset.sector, `${path}.sector`, 'Sector', issues);
  return issues;
}

export function validatePortfolioScenario(data: PortfolioScenario): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  if (!arrayCheck(data.assets, 'assets', 'Assets', issues, 500)) return issues;
  data.assets.forEach((asset, index) => issues.push(...validateAsset(asset, index)));
  requireFinite(data.targetReturn, 'targetReturn', 'Target return', issues);
  requireNonNegative(data.maxRisk, 'maxRisk', 'Maximum risk', issues);
  if (!Number.isInteger(data.maxAssets) || data.maxAssets < 1) issues.push(issue('maxAssets', 'Maximum assets must be a positive integer.'));
  if (data.maxAssets > data.assets.length) issues.push(issue('maxAssets', 'Maximum assets exceeds the number of available assets.', 'warning'));
  requireNonNegative(data.minLiquidity, 'minLiquidity', 'Minimum liquidity', issues);
  return issues;
}

export function validateRobotTask(task: RobotTask, index: number): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  const path = `tasks[${index}]`;
  requireNonEmpty(task.id, `${path}.id`, 'Task id', issues);
  requireNonEmpty(task.station, `${path}.station`, 'Station', issues);
  requireNonEmpty(task.seamGroup, `${path}.seamGroup`, 'Seam group', issues);
  requirePositive(task.processingMinutes, `${path}.processingMinutes`, 'Processing minutes', issues);
  requireNonNegative(task.changeoverMinutes, `${path}.changeoverMinutes`, 'Changeover minutes', issues);
  requireNonNegative(task.priority, `${path}.priority`, 'Priority', issues);
  return issues;
}

export function validateRobotScenario(data: RobotScenario): ScenarioValidationIssue[] {
  const issues: ScenarioValidationIssue[] = [];
  if (!arrayCheck(data.tasks, 'tasks', 'Robot tasks', issues, 1_000)) return issues;
  data.tasks.forEach((task, index) => issues.push(...validateRobotTask(task, index)));
  if (!Number.isInteger(data.robots) || data.robots < 1 || data.robots > 200) issues.push(issue('robots', 'Robot count must be an integer from 1 to 200.'));
  requirePositive(data.shiftMinutes, 'shiftMinutes', 'Shift minutes', issues);
  requirePositive(data.maxTravelMeters, 'maxTravelMeters', 'Maximum travel metres', issues);
  requireNonNegative(data.valuePerMinuteSaved, 'valuePerMinuteSaved', 'Value per minute saved', issues);
  return issues;
}

export function validateScenarioForProblem(problem: OptimizationProblem, scenarioData: OptimizationInput['scenarioData']): ScenarioValidationIssue[] {
  switch (problem.domain) {
    case 'delivery': return validateDeliveryScenario(scenarioData as DeliveryScenario);
    case 'workforce': return validateWorkforceScenario(scenarioData as WorkforceScenario);
    case 'portfolio': return validatePortfolioScenario(scenarioData as PortfolioScenario);
    case 'robotics': return validateRobotScenario(scenarioData as RobotScenario);
    default: return [];
  }
}

export function summarizeScenarioIssues(issues: ScenarioValidationIssue[]): string {
  const errors = issues.filter(item => item.severity === 'error').length;
  const warnings = issues.filter(item => item.severity === 'warning').length;
  return `${errors} error(s), ${warnings} warning(s).`;
}

export function scenarioIsUsable(issues: ScenarioValidationIssue[]): boolean {
  return !issues.some(item => item.severity === 'error');
}

export function buildScenarioFingerprint(problem: OptimizationProblem, data: unknown): string {
  const payload = JSON.stringify({ id: problem.id, domain: problem.domain, data });
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function normalizedScenarioLoad(problem: OptimizationProblem, data: OptimizationInput['scenarioData']): number {
  const issues = validateScenarioForProblem(problem, data);
  if (!scenarioIsUsable(issues)) return 0;
  const rawVariables = finiteNumber(problem.variables, 1);
  return Math.min(1, rawVariables / positiveNumber(problem.scale, rawVariables));
}
