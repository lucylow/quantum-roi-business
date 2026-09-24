export type GateKind = "H" | "X" | "CX" | "RX";
export type Gate = { id: string; kind: GateKind; qubits: number[]; parameter?: number };

export const DEFAULT_GATES: Gate[] = [{ id: "h-1", kind: "H", qubits: [0] }, { id: "cx-1", kind: "CX", qubits: [0, 1] }];

export function validateCircuit(gates: Gate[], qubits: number): string[] {
  const issues: string[] = [];
  if (qubits < 1 || qubits > 12) issues.push("Circuit size must be between 1 and 12 qubits.");
  gates.forEach((gate) => {
    if (gate.qubits.some((qubit) => qubit < 0 || qubit >= qubits)) issues.push(`${gate.kind} references an invalid qubit.`);
    if (gate.kind === "RX" && (gate.parameter === undefined || gate.parameter < -6.28 || gate.parameter > 6.28)) issues.push("RX angle must be between -2π and 2π.");
  });
  return issues;
}

export function addGate(gates: Gate[], kind: GateKind): Gate[] {
  const id = `${kind.toLowerCase()}-${gates.length + 1}`;
  return [...gates, { id, kind, qubits: kind === "CX" ? [0, 1] : [0], parameter: kind === "RX" ? 0.5 : undefined }];
}

export function removeGate(gates: Gate[], gateId: string): Gate[] {
  return gates.filter((gate) => gate.id !== gateId);
}

export function moveGate(gates: Gate[], gateId: string, targetIndex: number): Gate[] {
  const currentIndex = gates.findIndex((gate) => gate.id === gateId);
  if (currentIndex < 0) return gates;
  const next = [...gates];
  const [gate] = next.splice(currentIndex, 1);
  next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, gate);
  return next;
}

export function updateGateParameter(gates: Gate[], gateId: string, parameter: number): Gate[] {
  return gates.map((gate) => gate.id === gateId ? { ...gate, parameter } : gate);
}
