import { describe, expect, it } from "vitest";
import { addGate, DEFAULT_GATES, validateCircuit } from "../src/quantum-studio";

describe("Quantum Studio", () => {
  it("adds a bounded parameterized gate", () => {
    const gates = addGate(DEFAULT_GATES, "RX");
    expect(gates.at(-1)?.kind).toBe("RX");
    expect(validateCircuit(gates, 2)).toEqual([]);
  });

  it("rejects gates that address unavailable qubits", () => {
    expect(validateCircuit([{ id: "bad", kind: "CX", qubits: [0, 2] }], 2)).toContain("CX references an invalid qubit.");
  });
});
