#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

function readJson(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    errors.push(`${relativePath} is missing.`);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { errors.push(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`); return null; }
}

function assert(condition, message) { if (!condition) errors.push(message); }
function warn(condition, message) { if (!condition) warnings.push(message); }

const pkg = readJson('package.json');
const eas = readJson('eas.json');
const tsconfig = readJson('tsconfig.json');

assert(pkg?.name === 'quantum-roi-business', 'package.json name must remain quantum-roi-business.');
assert(pkg?.private === true, 'package.json must remain private to prevent accidental npm publication.');
assert(pkg?.main === 'expo/AppEntry.js', 'package.json main must point to the Expo application entry.');
assert(typeof pkg?.scripts?.['build:ios:production'] === 'string', 'Production iOS build script is missing.');
assert(pkg?.scripts?.['build:ios:production']?.includes('npx --yes eas-cli@^16.20.0'), 'Production builds must invoke a compatible EAS CLI through npx.');
assert(pkg?.scripts?.['submit:ios']?.includes('npx --yes eas-cli@^16.20.0'), 'iOS submission must invoke a compatible EAS CLI through npx.');
assert(!pkg?.dependencies?.['eas-cli'] && !pkg?.devDependencies?.['eas-cli'], 'eas-cli must not be installed locally; Expo Doctor flags it as a legacy local CLI.');
assert(typeof pkg?.scripts?.validate === 'string', 'Release validation script is missing.');
assert(/^~57\.0\.\d+$/.test(pkg?.dependencies?.expo ?? ''), 'Expo must remain on the SDK 57 patch line.');
assert(/^0\.86\.\d+$/.test(pkg?.dependencies?.['react-native'] ?? ''), 'React Native must remain on the Expo SDK 57 compatibility line.');
assert(pkg?.dependencies?.react === '19.2.3', 'React must remain aligned to Expo SDK 57.');
assert(!pkg?.dependencies?.['@types/react-native'], '@types/react-native should not be installed as a duplicate community type package.');

assert(eas?.cli?.appVersionSource === 'remote', 'EAS must use the remote app-version source.');
assert(eas?.build?.production?.autoIncrement === true, 'Production builds must auto-increment the iOS build number.');
assert(eas?.build?.production?.distribution === 'store', 'Production profile must target App Store distribution.');
assert(eas?.build?.production?.image === 'sdk-57', 'Production profile must use the SDK 57 EAS build image.');
assert(!eas?.build?.development?.developmentClient, 'A development-client build profile must not be referenced without expo-dev-client.');

assert(tsconfig?.compilerOptions?.strict === true, 'TypeScript strict mode must be enabled.');
assert(tsconfig?.compilerOptions?.noEmit === true, 'TypeScript validation config must not emit JavaScript.');

for (const required of ['app.config.ts', 'App.tsx', 'assets/icon.png', 'privacy-manifest.xcprivacy']) {
  assert(fs.existsSync(path.join(root, required)), `${required} is required for the release package.`);
}

const icon = fs.statSync(path.join(root, 'assets/icon.png'));
assert(icon.size > 1000, 'assets/icon.png appears to be empty or suspiciously small.');

const source = fs.readFileSync(path.join(root, 'app.config.ts'), 'utf8');
assert(source.includes("bundleIdentifier: 'com.lucylow.quantumroi'"), 'A stable iOS bundle identifier is required.');
assert(source.includes("deploymentTarget: '16.4'"), 'The release config must declare the supported iOS deployment target.');
assert(source.includes('usesNonExemptEncryption: false'), 'Export-compliance configuration must be explicit.');
assert(source.includes('privacyManifests: {'), 'iOS privacy-manifest configuration must be present.');
assert(!source.includes('http://localhost'), 'Production app configuration must not hard-code localhost.');

const example = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
warn(example.includes('api.example.com'), 'EXPO_PUBLIC_API_BASE_URL is still the example endpoint; set your real HTTPS API endpoint before cloud-backed production use.');
warn(example.includes('example.com/privacy'), 'EXPO_PUBLIC_PRIVACY_POLICY_URL is still a placeholder; set a real public privacy-policy URL before App Store submission.');
warn(example.includes('example.com/support'), 'EXPO_PUBLIC_SUPPORT_URL is still a placeholder; set a real support URL before App Store submission.');

const secrets = /AWS_SECRET_ACCESS_KEY\s*=\s*(?!replace-me$)\S+/i;
for (const rel of ['.env', 'server/.env', '.env.production']) {
  const file = path.join(root, rel);
  if (fs.existsSync(file) && secrets.test(fs.readFileSync(file, 'utf8'))) errors.push(`${rel} appears to contain a real AWS secret.`);
}

console.log('Quantum ROI release validation');
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
for (const message of errors) console.error(`ERROR: ${message}`);
for (const message of warnings) console.warn(`WARN: ${message}`);

if (errors.length) process.exit(1);
