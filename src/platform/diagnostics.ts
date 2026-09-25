import { Platform } from 'react-native';
import { runtimeConfig } from '../config';
import { getReleaseInfo } from './releaseInfo';

export interface DiagnosticItem {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'blocked';
  detail: string;
}

export function collectDiagnostics(): DiagnosticItem[] {
  const release = getReleaseInfo();
  const items: DiagnosticItem[] = [
    { id: 'platform', label: 'Platform', status: Platform.OS === 'ios' ? 'pass' : 'warn', detail: Platform.OS === 'ios' ? 'iOS runtime detected.' : `${Platform.OS} runtime detected.` },
    { id: 'api', label: 'Optimization API', status: release.remoteConfigured ? 'pass' : 'warn', detail: release.remoteConfigured ? 'HTTPS endpoint configured.' : 'Local-first mode; remote optimization is optional.' },
    { id: 'privacy', label: 'Privacy policy', status: runtimeConfig.privacyPolicyUrl ? 'pass' : 'blocked', detail: runtimeConfig.privacyPolicyUrl ? 'Privacy policy URL configured.' : 'Configure EXPO_PUBLIC_PRIVACY_POLICY_URL before App Store submission.' },
    { id: 'support', label: 'Support URL', status: runtimeConfig.supportUrl ? 'pass' : 'warn', detail: runtimeConfig.supportUrl ? 'Support URL configured.' : 'Support URL is not configured in this build.' },
    { id: 'telemetry', label: 'Telemetry', status: 'pass', detail: 'No remote telemetry SDK is bundled by this project.' },
    { id: 'credentials', label: 'AWS credentials', status: 'pass', detail: 'AWS credential material is intentionally server-only.' },
  ];
  return items;
}
