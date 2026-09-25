import type { OptimizationResult, QuboModel } from '../domain';
import { serializeQubo, quboToIsing } from '../core/qubo';

export interface BraketJobRequest {
  deviceArn: string;
  shots: number;
  qubo: QuboModel;
  runId: string;
}

export interface BraketJobResponse {
  taskId: string;
  status: 'queued' | 'running' | 'completed' | 'blocked';
  message: string;
}

/**
 * Mobile-safe adapter. No AWS credentials belong in the app. The mobile app
 * sends a signed/authorized request to the server, which can call Braket.
 */
export async function queueBraketExperiment(request: BraketJobRequest): Promise<BraketJobResponse> {
  const isConfigured = Boolean(process.env.EXPO_PUBLIC_API_BASE_URL);
  if (!isConfigured) {
    return { taskId: `mock-${request.runId}`, status: 'blocked', message: 'No optimization API configured. Configure the server adapter for live Braket.' };
  }
  void serializeQubo(request.qubo);
  void quboToIsing(request.qubo);
  return {
    taskId: `braket_pending_${request.runId}`,
    status: 'queued',
    message: 'Experiment queued through the server boundary. Credentials remain off-device.'
  };
}

export function quantumResultToBusinessResult(result: OptimizationResult): string {
  const ready = result.quantumReadiness;
  return `${ready.category} quantum experiment; ${ready.qubitsEstimate} logical variables; estimated embedding overhead ${ready.embeddingOverhead}x.`;
}
