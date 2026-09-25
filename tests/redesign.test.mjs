import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

test('redesign entrypoint imports the new frontend shell', () => {
  const app = file('App.tsx');
  assert.match(app, /redesign\/components\/enterprise/);
  assert.match(app, /OverviewScreen/);
  assert.match(app, /QuantumLabScreen/);
  assert.match(app, /RunsScreen/);
});

test('redesign data explicitly uses synthetic enterprise records', () => {
  const data = file('src/redesign/data/mockEnterprise.ts');
  assert.match(data, /Middle-mile delivery network/);
  assert.match(data, /Workforce rostering/);
  assert.match(data, /Diversified portfolio selection/);
  assert.match(data, /Robot seam-path planning/);
});

test('quantum lab contains a no-fabrication cloud execution gate', () => {
  const screen = file('src/redesign/screens/QuantumLabScreen.tsx');
  assert.match(screen, /SIMULATED \/ DEMO/);
  assert.match(screen, /not automatic/);
  assert.match(screen, /never fabricates a completed QPU result/i);
});

test('iOS package stays on the checked Expo SDK 57 line', () => {
  const pkg = JSON.parse(file('package.json'));
  assert.match(pkg.dependencies.expo, /^~57\./);
  assert.equal(pkg.dependencies['react-native'], '0.86.3');
  assert.equal(pkg.dependencies.react, '19.2.3');
});

test('production app config has stable iOS identity and HTTPS metadata hooks', () => {
  const config = file('app.config.ts');
  assert.match(config, /bundleIdentifier: 'com\.lucylow\.quantumroi'/);
  assert.match(config, /deploymentTarget: '16\.4'/);
  assert.match(config, /privacyManifests:/);
  assert.match(config, /EXPO_PUBLIC_PRIVACY_POLICY_URL/);
});

test('redesign has a focused five-item mobile navigation with workspace shortcuts', () => {
  const nav = file('src/redesign/components/enterprise.tsx');
  for (const label of ['Overview', 'Cases', 'Run', 'Impact', 'More']) assert.match(nav, new RegExp(label));
  const settings = file('src/redesign/screens/SettingsRedesignScreen.tsx');
  for (const label of ['Scenario lab', 'Quantum readiness', 'Experiment history']) assert.match(settings, new RegExp(label));
});

test('redesign uses responsive mobile layout primitives', () => {
  const app = file('App.tsx');
  const overview = file('src/redesign/screens/OverviewScreen.tsx');
  const workbench = file('src/redesign/screens/WorkbenchScreen.tsx');
  assert.match(app, /SafeAreaView/);
  assert.match(overview, /useResponsiveLayout/);
  assert.match(workbench, /useResponsiveLayout/);
});
