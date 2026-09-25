import { runtimeConfig } from '../config';

export interface ReleaseInfo {
  environment: string;
  localOnly: boolean;
  remoteConfigured: boolean;
  requiresPrivacyUrl: boolean;
}

export function getReleaseInfo(): ReleaseInfo {
  return {
    environment: runtimeConfig.appEnvironment,
    localOnly: !Boolean(runtimeConfig.apiBaseUrl),
    remoteConfigured: Boolean(runtimeConfig.apiBaseUrl),
    requiresPrivacyUrl: runtimeConfig.isProduction,
  };
}
