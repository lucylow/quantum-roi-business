export interface RoutingPoint { id: string; x: number; y: number; demand: number; service: number; ready: number; due: number; }
export interface RoutingVehicle { id: string; capacity: number; maxMinutes: number; costPerDistance: number; fixedCost: number; }
export interface RouteScore { distance: number; time: number; cost: number; lateStops: number; capacityOverflow: number; }

export function distance(a: RoutingPoint, b: RoutingPoint): number { const dx = a.x - b.x; const dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
export function scoreRoute(points: RoutingPoint[], order: number[], vehicle: RoutingVehicle): RouteScore {
  let d = 0; let t = 0; let load = 0; let lateStops = 0; let previous = points[0];
  order.forEach((index) => { const p = points[index]; const leg = distance(previous, p); d += leg; t += leg * 2.0 + p.service; load += p.demand; if (t > p.due || t < p.ready) lateStops += 1; previous = p; });
  d += distance(previous, points[0]); t += distance(previous, points[0]) * 2.0;
  return { distance: d, time: t, cost: vehicle.fixedCost + d * vehicle.costPerDistance, lateStops, capacityOverflow: Math.max(0, load - vehicle.capacity) };
}

export interface WorkforceDemand { slot: string; demand: number; role: string; duration: number; }
export interface WorkforceResource { id: string; role: string; hourlyCost: number; availability: string[]; }
export interface StaffingPlan { assignment: Record<string, string>; cost: number; uncovered: string[]; utilization: Record<string, number>; }

export function scoreStaffingPlan(demand: WorkforceDemand[], resources: WorkforceResource[], assignment: Record<string, string>, penalty = 500): StaffingPlan {
  let cost = 0; const uncovered: string[] = []; const utilization: Record<string, number> = {};
  demand.forEach((slot) => { const resourceId = assignment[slot.slot]; const worker = resources.find(r => r.id === resourceId); if (!worker || worker.role !== slot.role || !worker.availability.includes(slot.slot)) { uncovered.push(slot.slot); cost += penalty; return; } cost += worker.hourlyCost * slot.duration; utilization[worker.id] = (utilization[worker.id] ?? 0) + slot.duration; });
  return { assignment, cost, uncovered, utilization };
}

export interface PortfolioPosition { id: string; weight: number; expectedReturn: number; volatility: number; sector: string; }
export interface PortfolioScore { expectedReturn: number; weightedRisk: number; concentrationPenalty: number; objective: number; }

export function scorePortfolio(positions: PortfolioPosition[], targetReturn: number, maxRisk: number): PortfolioScore {
  const total = positions.reduce((s, p) => s + p.weight, 0) || 1;
  const expectedReturn = positions.reduce((s, p) => s + p.weight * p.expectedReturn, 0) / total;
  const weightedRisk = positions.reduce((s, p) => s + p.weight * p.volatility, 0) / total;
  const sectors = new Map<string, number>(); positions.forEach(p => sectors.set(p.sector, (sectors.get(p.sector) ?? 0) + p.weight));
  const concentrationPenalty = [...sectors.values()].reduce((s, weight) => s + Math.max(0, weight - 0.4) ** 2, 0);
  const objective = -expectedReturn + Math.max(0, weightedRisk - maxRisk) * 8 + Math.max(0, targetReturn - expectedReturn) * 6 + concentrationPenalty;
  return { expectedReturn, weightedRisk, concentrationPenalty, objective };
}

export interface EnergyUnit { id: string; minOutput: number; maxOutput: number; variableCost: number; startupCost: number; }
export interface EnergyPeriod { id: string; demand: number; reserve: number; }
export interface Commitment { period: string; unit: string; online: boolean; output: number; }

export function validateEnergyCommitment(units: EnergyUnit[], periods: EnergyPeriod[], commitments: Commitment[]): string[] {
  const violations: string[] = [];
  periods.forEach((period) => {
    const rows = commitments.filter(c => c.period === period.id && c.online);
    const supply = rows.reduce((s, c) => { const u = units.find(x => x.id === c.unit); return s + Math.min(u?.maxOutput ?? 0, Math.max(0, c.output)); }, 0);
    if (supply < period.demand + period.reserve) violations.push(`${period.id}: supply gap ${(period.demand + period.reserve - supply).toFixed(1)} MW`);
  });
  commitments.forEach((c) => { const u = units.find(x => x.id === c.unit); if (!u) violations.push(`Unknown unit ${c.unit}`); else if (c.online && (c.output < u.minOutput || c.output > u.maxOutput)) violations.push(`${c.unit}: output ${c.output} outside [${u.minOutput}, ${u.maxOutput}]`); });
  return violations;
}

export interface AdCandidate { id: string; audience: number; predictedRevenue: number; cost: number; category: string; }
export interface AdSelection { selected: string[]; revenue: number; cost: number; reach: number; categories: number; }

export function scoreAdSelection(candidates: AdCandidate[], selection: string[], budget: number): AdSelection {
  const rows = candidates.filter(c => selection.includes(c.id)); const revenue = rows.reduce((s, c) => s + c.predictedRevenue, 0); const cost = rows.reduce((s, c) => s + c.cost, 0); const reach = rows.reduce((s, c) => s + c.audience, 0); const categories = new Set(rows.map(c => c.category)).size;
  return { selected: rows.map(c => c.id), revenue: cost <= budget ? revenue : revenue - (cost - budget) * 4, cost, reach, categories };
}

export interface ClinicalSite { id: string; eligiblePool: number; dailyCapacity: number; costPerPatient: number; }
export interface EnrollmentPlan { site: string; day: number; count: number; }
export function scoreEnrollment(sites: ClinicalSite[], plan: EnrollmentPlan[], target: number): { enrolled: number; cost: number; days: number; gap: number } {
  const enrolled = plan.reduce((s, p) => s + Math.max(0, p.count), 0); const cost = plan.reduce((s, p) => { const site = sites.find(x => x.id === p.site); return s + (site ? p.count * site.costPerPatient : p.count * 1000); }, 0); const days = Math.max(0, ...plan.map(p => p.day));
  return { enrolled: Math.min(target, enrolled), cost, days, gap: Math.max(0, target - enrolled) };
}

export interface ReinsuranceLayer { id: string; limit: number; attachment: number; premium: number; expectedLoss: number; counterparty: string; }
export function scoreReinsurance(layers: ReinsuranceLayer[], selected: string[], capitalBudget: number): { premium: number; expectedLoss: number; capital: number; concentration: number } {
  const rows = layers.filter(l => selected.includes(l.id)); const premium = rows.reduce((s, l) => s + l.premium, 0); const expectedLoss = rows.reduce((s, l) => s + l.expectedLoss, 0); const capital = rows.reduce((s, l) => s + l.limit * 0.15, 0); const counterpartyExposure = new Map<string, number>(); rows.forEach(l => counterpartyExposure.set(l.counterparty, (counterpartyExposure.get(l.counterparty) ?? 0) + l.limit)); const top = Math.max(0, ...counterpartyExposure.values()); const concentration = capitalBudget ? top / capitalBudget : 0;
  return { premium, expectedLoss, capital, concentration };
}

export interface FlightOption { id: string; aircraft: string; slot: string; value: number; delayRisk: number; }
export function scoreFlightSchedule(options: FlightOption[], selected: string[]): { value: number; delayRisk: number; conflicts: number } {
  const rows = options.filter(x => selected.includes(x.id)); const slots = new Set<string>(); let conflicts = 0; rows.forEach(x => { if (slots.has(x.slot)) conflicts += 1; slots.add(x.slot); });
  return { value: rows.reduce((s, x) => s + x.value, 0) - conflicts * 1000, delayRisk: rows.reduce((s, x) => s + x.delayRisk, 0) / Math.max(1, rows.length), conflicts };
}

export interface SportMatch { id: string; home: string; away: string; venue: string; slot: string; travelCost: number; broadcastValue: number; }
export function scoreSportsSchedule(matches: SportMatch[], selected: string[]): { travel: number; broadcast: number; conflicts: number } {
  const rows = matches.filter(m => selected.includes(m.id)); const slotCounts = rows.reduce((m, r) => { m[r.slot] = (m[r.slot] ?? 0) + 1; return m; }, {} as Record<string, number>); const conflicts = Object.values(slotCounts).reduce((s, c) => s + Math.max(0, c - 1), 0);
  return { travel: rows.reduce((s, m) => s + m.travelCost, 0), broadcast: rows.reduce((s, m) => s + m.broadcastValue, 0) - conflicts * 50, conflicts };
}

export function normalizedBusinessScore(value: number, min: number, max: number): number { if (max === min) return 0.5; return Math.max(0, Math.min(1, (value - min) / (max - min))); }
export function tradeoffScore(value: number, cost: number, alpha = 1, beta = 1): number { return alpha * value - beta * cost; }
