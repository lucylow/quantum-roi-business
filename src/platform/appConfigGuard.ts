import { runtimeConfig } from '../config';

export interface AppConfigIssue {
  id: string;
  severity: 'error' | 'warning';
  message: string;
}

function isUrl(value: string, httpsOnly: boolean): boolean {
  try {
    const url = new URL(value);
    if (!url.hostname) return false;
    if (httpsOnly && url.protocol !== 'https:') return false;
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateRuntimeConfig(): AppConfigIssue[] {
  const issues: AppConfigIssue[] = [];
  if (runtimeConfig.isProduction) {
    if (!runtimeConfig.privacyPolicyUrl) issues.push({ id: 'privacy-url', severity: 'error', message: 'Production builds require a public privacy-policy URL.' });
    else if (!isUrl(runtimeConfig.privacyPolicyUrl, true)) issues.push({ id: 'privacy-url-format', severity: 'error', message: 'Privacy-policy URL must be HTTPS.' });
    if (runtimeConfig.apiBaseUrl && !isUrl(runtimeConfig.apiBaseUrl, true)) issues.push({ id: 'api-url', severity: 'error', message: 'Production API endpoint must use HTTPS.' });
  } else {
    if (runtimeConfig.apiBaseUrl && !isUrl(runtimeConfig.apiBaseUrl, false)) issues.push({ id: 'api-url-dev', severity: 'warning', message: 'Configured API endpoint is not a valid URL.' });
  }
  if (!runtimeConfig.supportUrl) issues.push({ id: 'support-url', severity: 'warning', message: 'Support URL is not configured in this build.' });
  return issues;
}

export function configIsSafe(): boolean {
  return !validateRuntimeConfig().some(issue => issue.severity === 'error');
}
