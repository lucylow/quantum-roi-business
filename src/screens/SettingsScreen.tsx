import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/Header';
import { Screen, Button, Card, Pill, Section } from '../components/Primitives';
import { colors, spacing } from '../theme';
import { DiagnosticsCard } from '../components/DiagnosticsCard';
import { ReleaseGateCard } from '../components/ReleaseGateCard';
import { NetworkPolicyCard } from '../components/NetworkPolicyCard';
import { runtimeConfig } from '../config';

async function openConfiguredUrl(url: string): Promise<void> {
  if (!url) return;
  try {
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  } catch {
    // A failed external link must not break the settings screen.
  }
}

export function SettingsScreen() {
  const [localOnly, setLocalOnly] = useState(true);
  const [telemetry, setTelemetry] = useState(false);
  return <Screen><View style={styles.container}><AppHeader eyebrow="GOVERNANCE" title="Control the experiment boundary." subtitle="Enterprise optimization needs reproducibility, credential isolation, and explicit data movement." badge="PRIVATE" />
    <Section title="Execution policy"><Card><Setting label="Local-first mode" body="Run deterministic solvers on-device before using the API." value={localOnly} onPress={() => setLocalOnly(v => !v)} /><Setting label="Telemetry" body="Keep product telemetry off by default in the demo." value={telemetry} onPress={() => setTelemetry(v => !v)} /><Setting label="AWS credentials" body="Never store access keys or secret material inside the mobile bundle." value={true} locked /></Card></Section>
    <ReleaseGateCard />
    <DiagnosticsCard />
    <NetworkPolicyCard />
    <Section title="Privacy & support"><Card title="Your information" eyebrow="APP STORE"><Text style={styles.body}>Core optimization runs stay on-device unless an HTTPS API endpoint is deliberately configured. This build does not include telemetry by default.</Text><View style={styles.links}>{runtimeConfig.privacyPolicyUrl ? <Button title="View privacy policy" kind="secondary" onPress={() => { void openConfiguredUrl(runtimeConfig.privacyPolicyUrl); }} /> : <Text style={styles.warning}>Privacy-policy URL is not configured in this build.</Text>}{runtimeConfig.supportUrl ? <Button title="Contact support" kind="secondary" onPress={() => { void openConfiguredUrl(runtimeConfig.supportUrl); }} /> : <Text style={styles.muted}>Support URL is not configured in this build.</Text>}</View></Card></Section>
    <Card title="Enterprise guardrails" eyebrow="RECOMMENDED"><View style={styles.list}>{['Treat model inputs as potentially sensitive business data.', 'Use least-privilege IAM roles on the backend.', 'Store quantum-task outputs in customer-controlled AWS accounts.', 'Record solver version, seed, constraints, and model hash for every run.', 'Never report a quantum speedup without a like-for-like baseline and reproducible benchmark.'].map(item => <Text key={item} style={styles.body}>✓ {item}</Text>)}</View></Card>
    <Card><Pill tone="cyan">BRAG-READY, NOT HYPE-READY</Pill><Text style={styles.body}>The product story becomes stronger when the app can answer: what decision improved, by how much, under which constraints, and what did the quantum experiment actually measure?</Text></Card>
  </View></Screen>;
}

function Setting({ label, body, value, onPress, locked = false }: { label: string; body: string; value: boolean; onPress?: () => void; locked?: boolean }) {
  return <Button title={`${label} · ${value ? 'ON' : 'OFF'}${locked ? ' · LOCKED' : ''}`} kind={value ? 'secondary' : 'ghost'} onPress={locked ? () => undefined : (onPress ?? (() => undefined))} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  list: { gap: 10 },
  links: { gap: 8 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  warning: { color: colors.amber, fontSize: 11, lineHeight: 17 }
});
