import type { ConfigContext, ExpoConfig } from 'expo/config';

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim();
const privacyPolicyUrl = (process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? '').trim();
const supportUrl = (process.env.EXPO_PUBLIC_SUPPORT_URL ?? '').trim();

function normaliseEnvironment(value: string | undefined): 'development' | 'preview' | 'production' {
  switch ((value ?? '').trim().toLowerCase()) {
    case 'development':
    case 'dev':
      return 'development';
    case 'preview':
    case 'staging':
      return 'preview';
    case 'production':
    case 'prod':
    case '':
      return 'production';
    default:
      return 'production';
  }
}

const environment = normaliseEnvironment(process.env.EXPO_PUBLIC_APP_ENV ?? process.env.APP_ENV);

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || (parsed.protocol === 'http:' && environment !== 'production');
  } catch {
    return false;
  }
}

function normaliseUrl(value: string): string | undefined {
  if (!value) return undefined;
  return isHttpUrl(value) ? value.replace(/\/$/, '') : undefined;
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Quantum ROI',
  slug: 'quantum-roi-business',
  version: '2.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'quantumroi',
  userInterfaceStyle: 'dark',
  backgroundColor: '#07111F',
  ios: {
    ...(config.ios ?? {}),
    supportsTablet: true,
    bundleIdentifier: 'com.lucylow.quantumroi',
    deploymentTarget: '16.4',
    config: {
      ...(config.ios?.config ?? {}),
      // This app uses platform HTTPS/TLS and no custom encryption primitives.
      // Re-check this declaration if proprietary encryption is added later.
      usesNonExemptEncryption: false,
    },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyCollectedDataTypes: [],
      NSPrivacyAccessedAPITypes: [],
    },
  },
  android: {
    ...(config.android ?? {}),
    package: 'com.lucylow.quantumroi',
    versionCode: 1,
  },
  web: {
    ...(config.web ?? {}),
    bundler: 'metro',
  },
  extra: {
    ...(config.extra ?? {}),
    appEnvironment: environment,
    apiBaseUrl: normaliseUrl(apiBaseUrl) ?? '',
    privacyPolicyUrl: normaliseUrl(privacyPolicyUrl) ?? '',
    supportUrl: normaliseUrl(supportUrl) ?? '',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
