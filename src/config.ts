import Constants from 'expo-constants';

export interface RuntimeConfig {
  appEnvironment: 'development' | 'preview' | 'production' | 'unknown';
  apiBaseUrl: string;
  privacyPolicyUrl: string;
  supportUrl: string;
  isProduction: boolean;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

const appExtra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

function configValue(key: string, fallback: unknown): string {
  return stringValue(appExtra[key]) || stringValue(fallback);
}

const appEnvironmentValue = configValue('appEnvironment', process.env.EXPO_PUBLIC_APP_ENV);
const appEnvironment: RuntimeConfig['appEnvironment'] =
  appEnvironmentValue === 'development' ||
  appEnvironmentValue === 'preview' ||
  appEnvironmentValue === 'production'
    ? appEnvironmentValue
    : 'unknown';

export const runtimeConfig: RuntimeConfig = Object.freeze({
  appEnvironment,
  apiBaseUrl: configValue('apiBaseUrl', process.env.EXPO_PUBLIC_API_BASE_URL).replace(/\/$/, ''),
  privacyPolicyUrl: configValue('privacyPolicyUrl', process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL),
  supportUrl: configValue('supportUrl', process.env.EXPO_PUBLIC_SUPPORT_URL),
  isProduction: appEnvironment === 'production',
});

export function assertSafeApiUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (runtimeConfig.isProduction) return parsed.protocol === 'https:';
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
