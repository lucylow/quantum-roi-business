import { runtimeConfig, assertSafeApiUrl } from '../config';

export interface NetworkPolicyState {
  mode: 'local' | 'remote';
  allowed: boolean;
  endpoint: string;
  reason: string;
}

export function getNetworkPolicy(): NetworkPolicyState {
  const endpoint = runtimeConfig.apiBaseUrl;
  if (!endpoint) return { mode: 'local', allowed: true, endpoint: '', reason: 'No remote endpoint configured; local-first mode is active.' };
  if (!assertSafeApiUrl(endpoint)) return { mode: 'remote', allowed: false, endpoint, reason: 'Configured API endpoint does not satisfy the build security policy.' };
  return { mode: 'remote', allowed: true, endpoint, reason: 'Configured API endpoint passed URL policy.' };
}
