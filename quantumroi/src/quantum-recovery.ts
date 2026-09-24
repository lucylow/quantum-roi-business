export type QuantumJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type JobEvent = { type: "START" } | { type: "COMPLETE" } | { type: "FAIL" } | { type: "CANCEL" } | { type: "RETRY" };
export type Readiness = { ready: boolean; reasons: string[] };

export function transition(status: QuantumJobStatus, event: JobEvent): QuantumJobStatus {
  if (event.type === "START" && status === "queued") return "running";
  if (event.type === "COMPLETE" && status === "running") return "completed";
  if (event.type === "FAIL" && (status === "queued" || status === "running")) return "failed";
  if (event.type === "CANCEL" && (status === "queued" || status === "running")) return "cancelled";
  if (event.type === "RETRY" && (status === "failed" || status === "cancelled")) return "queued";
  return status;
}

export function nextPollDelayMs(attempt: number): number { return Math.min(30_000, 1_000 * 2 ** Math.min(Math.max(attempt, 0), 5)); }

export function hardwareReadiness(gates: number, qubits: number, backendQubits?: number): Readiness {
  const reasons: string[] = [];
  if (backendQubits === undefined) reasons.push("Select a backend.");
  if (backendQubits !== undefined && backendQubits < qubits) reasons.push(`Backend supports ${backendQubits} qubits; circuit needs ${qubits}.`);
  if (gates < 1) reasons.push("Add at least one gate before execution.");
  return { ready: reasons.length === 0, reasons };
}

export function assertResultShape(result: { jobId?: string; shots: number; measurements: { bitstring: string; count: number }[] }): void {
  if (!result.jobId) throw new Error("Missing job id");
  if (result.shots <= 0) throw new Error("Shots must be positive");
  if (!Array.isArray(result.measurements)) throw new Error("Measurements must be an array");
  if (result.measurements.some((row) => !row.bitstring || row.count < 0)) throw new Error("Invalid measurement row");
}
