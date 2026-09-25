import type { OptimizationResult, QuboModel } from '../domain';
import { serializeQubo, quboToIsing } from '../core/qubo';
import { runtimeConfig } from '../config';
import { requestJson } from './http';

export interface BraketJobRequest {
  deviceArn: string;
  shots: number;
  qubo: QuboModel;
  runId: string;
}

export interface BraketJobResponse {
  taskId: string;
  status: 'queued' | 'running' | 'completed' | 'blocked' | 'error';
  message: string;
  issues?: string[];
}

export async function queueBraketExperiment(request: BraketJobRequest): Promise<BraketJobResponse> {
  serializeQubo(request.qubo);
  quboToIsing(request.qubo);

  if (!runtimeConfig.apiBaseUrl) {
    return { taskId: `local-${request.runId}`, status: 'blocked', message: 'Live Braket is disabled because this build has no server endpoint.' };
  }

  if (!/^arn:aws:braket:[a-z0-9-]+::device\/(qpu|simulator)\//.test(request.deviceArn)) {
    return { taskId: `invalid-${request.runId}`, status: 'error', message: 'The configured Braket device ARN is invalid.' };
  }

  try {
    return await requestJson<BraketJobResponse>(runtimeConfig.apiBaseUrl, '/v1/braket/submit', {
      method: 'POST',
      body: JSON.stringify({ ...request, qubo: request.qubo }),
    }, { timeoutMs: 10_000, retries: 0 });
  } catch (error) {
    return {
      taskId: `error-${request.runId}`,
      status: 'error',
      message: error instanceof Error ? error.message.slice(0, 250) : 'Quantum experiment request failed.',
    };
  }
}

export function quantumResultToBusinessResult(result: OptimizationResult): string {
  const ready = result.quantumReadiness;
  return `${ready.category}; ${ready.qubitsEstimate} logical variables; estimated embedding overhead ${ready.embeddingOverhead}x.`;
}
