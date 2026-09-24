import { describe, expect, it } from "vitest";
import { runDemoOptimization, validateRouteInput } from "../src/quantumroi-mvp";

describe("QuantumROI demo optimization", () => {
  it("rejects incomplete route inputs", () => {
    const errors = validateRouteInput({ businessName: "", depot: "", stops: 1, vehicles: 0, maxHours: 0, costPerMile: 0 });
    expect(errors).toHaveLength(6);
  });

  it("returns an explicitly labeled simulated comparison", () => {
    const result = runDemoOptimization({ businessName: "Harbor & Pine", depot: "Miami", stops: 47, vehicles: 8, maxHours: 8, costPerMile: 1.15 });
    expect(result.status).toBe("DEMO MODE");
    expect(result.methods).toHaveLength(3);
    expect(result.methods.find((method) => method.method === "quantum-simulation")?.evidence).toBe("simulation");
    expect(result.bestMiles).toBeLessThan(result.baselineMiles);
    expect(result.estimatedMonthlySavings).toBeGreaterThan(0);
  });
});
