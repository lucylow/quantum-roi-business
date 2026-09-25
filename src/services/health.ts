import { getHealth } from './api';
import { runtimeConfig } from '../config';

export interface HealthState {
  reachable: boolean;
  detail: string;
  checkedAt: string;
}

export async function checkApiHealth(): Promise<HealthState> {
  if (!runtimeConfig.apiBaseUrl) {
    return { reachable: false, detail: 'Local-first mode is active; no remote service configured.', checkedAt: new Date().toISOString() };
  }
  try {
    const response = await getHealth();
    return {
      reachable: Boolean(response.ok),
      detail: response.ok ? `${response.service} ${response.version}` : 'Health endpoint returned not-ok.',
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return { reachable: false, detail: error instanceof Error ? error.message.slice(0, 180) : 'Health check failed.', checkedAt: new Date().toISOString() };
  }
}
