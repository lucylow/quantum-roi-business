export type OptimizationMethod = "classical" | "quantum-inspired" | "quantum-simulation";

export type RouteInput = {
  businessName: string;
  depot: string;
  stops: number;
  vehicles: number;
  maxHours: number;
  costPerMile: number;
};

export type OptimizationResult = {
  id: string;
  businessName: string;
  baselineMiles: number;
  bestMiles: number;
  estimatedMonthlySavings: number;
  improvementPercent: number;
  recommendedMethod: OptimizationMethod;
  status: "COMPLETED" | "DEMO MODE";
  methods: {
    method: OptimizationMethod;
    miles: number;
    runtime: string;
    evidence: "measured" | "estimated" | "simulation";
    note: string;
  }[];
};

export function validateRouteInput(input: RouteInput): string[] {
  const errors: string[] = [];
  if (!input.businessName.trim()) errors.push("Add a business name.");
  if (!input.depot.trim()) errors.push("Add a depot location.");
  if (!Number.isInteger(input.stops) || input.stops < 2 || input.stops > 500) errors.push("Stops must be between 2 and 500.");
  if (!Number.isInteger(input.vehicles) || input.vehicles < 1 || input.vehicles > 50) errors.push("Vehicles must be between 1 and 50.");
  if (!Number.isFinite(input.maxHours) || input.maxHours <= 0) errors.push("Maximum route time must be greater than zero.");
  if (!Number.isFinite(input.costPerMile) || input.costPerMile <= 0) errors.push("Cost per mile must be greater than zero.");
  return errors;
}

export function runDemoOptimization(input: RouteInput): OptimizationResult {
  const baselineMiles = Math.round(input.stops * 8.25 + input.vehicles * 16);
  const classicalMiles = Math.round(baselineMiles * 0.88);
  const inspiredMiles = Math.round(baselineMiles * 0.81);
  const simulationMiles = Math.round(baselineMiles * 0.82);
  const bestMiles = Math.min(classicalMiles, inspiredMiles, simulationMiles);
  const improvementPercent = Math.round(((baselineMiles - bestMiles) / baselineMiles) * 1000) / 10;
  const estimatedMonthlySavings = Math.round((baselineMiles - bestMiles) * input.costPerMile * 22);
  return {
    id: `demo-${input.stops}-${input.vehicles}`,
    businessName: input.businessName.trim(),
    baselineMiles,
    bestMiles,
    estimatedMonthlySavings,
    improvementPercent,
    recommendedMethod: "quantum-inspired",
    status: "DEMO MODE",
    methods: [
      { method: "classical", miles: classicalMiles, runtime: "1.8 sec", evidence: "estimated", note: "Reliable baseline for comparison." },
      { method: "quantum-inspired", miles: inspiredMiles, runtime: "2.4 sec", evidence: "estimated", note: "Heuristic search found the strongest demo candidate." },
      { method: "quantum-simulation", miles: simulationMiles, runtime: "4.1 sec", evidence: "simulation", note: "Simulator output only; no quantum hardware was used." },
    ],
  };
}
