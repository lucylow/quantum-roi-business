import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

test('package uses the Expo 57 / React Native 0.86 compatibility line', () => {
  const pkg = readJson('package.json');
  assert.match(pkg.dependencies.expo, /^~57\.0\.\d+$/);
  assert.match(pkg.dependencies['react-native'], /^0\.86\.\d+$/);
  assert.equal(pkg.dependencies.react, '19.2.3');
});

test('production EAS build is configured for store distribution and remote versioning', () => {
  const eas = readJson('eas.json');
  const pkg = readJson('package.json');
  assert.equal(eas.cli.appVersionSource, 'remote');
  assert.equal(eas.build.production.distribution, 'store');
  assert.equal(eas.build.production.autoIncrement, true);
  assert.equal(eas.build.production.image, 'sdk-57');
  assert.match(pkg.scripts['build:ios:production'], /npx --yes eas-cli@\^16\.20\.0/);
  assert.match(pkg.scripts['submit:ios'], /npx --yes eas-cli@\^16\.20\.0/);
  assert.equal(pkg.dependencies?.['eas-cli'] ?? pkg.devDependencies?.['eas-cli'], undefined);
});

test('mobile release configuration does not embed localhost', () => {
  const config = fs.readFileSync(path.join(root, 'app.config.ts'), 'utf8');
  assert.equal(config.includes('http://localhost'), false);
});

test('no mobile source contains an AWS access-key literal', () => {
  const roots = ['src'];
  const suspicious = /AKIA[0-9A-Z]{16}/i;
  const stack = roots.map(item => path.join(root, item));
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (/\.(ts|tsx)$/.test(entry.name)) assert.equal(suspicious.test(fs.readFileSync(absolute, 'utf8')), false, absolute);
    }
  }
});

test('privacy manifest has tracking disabled', () => {
  const manifest = fs.readFileSync(path.join(root, 'privacy-manifest.xcprivacy'), 'utf8');
  assert.match(manifest, /<key>NSPrivacyTracking<\/key>\s*<false\/>/);
});
