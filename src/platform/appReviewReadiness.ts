import { runtimeConfig } from '../config';
import { hasNoRuntimePermissionRequirements } from './permissions';

export interface AppReviewReadiness {
  pass: boolean;
  blockers: string[];
  warnings: string[];
}

export function checkAppReviewReadiness(): AppReviewReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (runtimeConfig.isProduction && !runtimeConfig.privacyPolicyUrl) {
    blockers.push('A public privacy-policy URL is required before App Store submission.');
  }
  if (!hasNoRuntimePermissionRequirements()) warnings.push('Runtime permissions are enabled; review usage descriptions before submission.');
  if (!runtimeConfig.apiBaseUrl) warnings.push('Remote API is disabled; demonstrate local-first functionality in the submitted build.');
  return { pass: blockers.length === 0, blockers, warnings };
}
