#!/usr/bin/env node
const required = [
  ['EXPO_PUBLIC_PRIVACY_POLICY_URL', 'public privacy-policy URL'],
  ['EXPO_PUBLIC_SUPPORT_URL', 'public support URL'],
];
const optionalRemoteApi = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? '';
const errors = [];

function https(value, label) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') errors.push(`${label} must use HTTPS.`);
    if (!url.hostname) errors.push(`${label} must contain a hostname.`);
  } catch {
    errors.push(`${label} must be a valid URL.`);
  }
}

for (const [name, label] of required) {
  const value = process.env[name]?.trim() ?? '';
  if (!value) errors.push(`${name} is required for an App Store submission.`);
  else if (/example\.com|replace-me|localhost/i.test(value)) errors.push(`${name} still contains a placeholder/local value.`);
  else https(value, label);
}

if (optionalRemoteApi) https(optionalRemoteApi, 'EXPO_PUBLIC_API_BASE_URL');

console.log('Strict App Store configuration check');
for (const error of errors) console.error(`ERROR: ${error}`);
if (!errors.length) console.log('Store metadata URLs are configured and HTTPS-valid.');
process.exit(errors.length ? 1 : 0);
