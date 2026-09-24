import { describe, expect, it } from "vitest";
import { assertResultShape, hardwareReadiness, nextPollDelayMs, transition } from "../src/quantum-recovery";

describe("Quantum recovery safeguards", () => {
  it("allows only valid job transitions", () => {
    expect(transition("queued", { type: "START" })).toBe("running");
    expect(transition("completed", { type: "RETRY" })).toBe("completed");
    expect(transition("failed", { type: "RETRY" })).toBe("queued");
  });

  it("returns actionable backend readiness reasons", () => {
    expect(hardwareReadiness(0, 3)).toEqual({ ready: false, reasons: ["Select a backend.", "Add at least one gate before execution."] });
    expect(hardwareReadiness(2, 3, 2).reasons[0]).toContain("circuit needs 3");
  });

  it("caps polling backoff and validates result shape", () => {
    expect(nextPollDelayMs(99)).toBe(30_000);
    expect(() => assertResultShape({ shots: 10, measurements: [] })).toThrow("Missing job id");
    expect(() => assertResultShape({ jobId: "job-1", shots: 10, measurements: [{ bitstring: "00", count: 4 }] })).not.toThrow();
  });
});
