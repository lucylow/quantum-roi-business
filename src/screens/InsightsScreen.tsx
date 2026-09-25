import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useCases, brief } from '../data/mock';
import { buildSensitivity } from '../core/sensitivity';
import { estimateBusinessImpact } from '../core/businessImpact';
import { buildAudit } from '../core/audit';
import type { OptimizationInput, ScreenName } from '../domain';
import { deliveryScenario, workforceScenario, portfolioScenario, robotScenario } from '../data/mock';
import { colors, spacing, typography } from '../theme';
import { AppHeader } from '../components/Header';
import { Screen, Button, Card, Pill, ProgressBar, Section } from '../components/Primitives';
import { shareExperimentBrief } from '../services/share';
import { Alert } from 'react-native';

function dataFor(domain: string) {
  switch (domain) { case 'delivery': return deliveryScenario; case 'workforce': return workforceScenario; case 'portfolio': return portfolioScenario; default: return robotScenario; }
}

export function InsightsScreen({ navigate }: { navigate: (screen: ScreenName) => void }) {
  const { selectedProblem, lastResult } = useApp();
  const sensitivity = useMemo(() => buildSensitivity(selectedProblem), [selectedProblem]);
  const input: OptimizationInput | null = lastResult ? { problem: selectedProblem, solver: lastResult.solver as any, seed: 42, iterations: 30, scenarioData: dataFor(selectedProblem.domain) } : null;
  const audit = input && lastResult ? buildAudit(input, lastResult) : null;
  const impact = lastResult ? estimateBusinessImpact(selectedProblem, lastResult) : [];
  const share = async () => {
    if (!lastResult) { Alert.alert('Run an experiment first', 'The share brief is generated from a reproducible optimization result.'); return; }
    try { await shareExperimentBrief({ title: selectedProblem.name, domain: selectedProblem.domain, result: lastResult, audit }); } catch (error) { Alert.alert('Share unavailable', error instanceof Error ? error.message : 'The share sheet could not be opened.'); }
  };

  return <Screen><View style={styles.container}><AppHeader eyebrow="EXECUTIVE INSIGHT" title="Turn optimization into a decision memo." subtitle="The same run can be read as math, operations, economics, or governance—without changing the underlying evidence." badge="BOARDROOM" />
    <Card style={styles.narrative}><Pill tone="cyan">ONE RUN · FOUR LENSES</Pill><Text style={styles.headline}>{brief.headline}</Text><Text style={styles.body}>{brief.impact}</Text></Card>
    <Section title="Business impact"><View style={styles.stack}>{impact.length ? impact.map(item => <Card key={item.title} style={styles.compact}><View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.body}>{item.statement}</Text></View><Text style={styles.value}>{item.value.toFixed(item.unit === 'USD' ? 0 : 1)} <Text style={styles.unit}>{item.unit}</Text></Text></View></Card>) : <Card><Text style={styles.body}>Run an experiment to generate modeled impact.</Text></Card>}</View></Section>
    <Section title="Sensitivity map"><Card><Text style={styles.body}>Move one assumption at a time before escalating a model to cloud quantum hardware.</Text><View style={styles.stack}>{sensitivity.map(point => <View key={point.id} style={{ gap: 5 }}><View style={styles.row}><Text style={styles.label}>{point.label}</Text><Text style={styles.muted}>{point.baseline}{point.unit}</Text></View><ProgressBar value={0.5} caption={`${point.low.toFixed(1)} → ${point.high.toFixed(1)}${point.unit}`} /></View>)}</View></Card></Section>
    <Card title="Governance record" eyebrow="REPRODUCIBILITY">{audit ? <View style={styles.stack}>{[['MODEL', audit.modelHash], ['INPUT', audit.inputHash], ['RESULT', audit.resultHash], ['SEED', String(audit.seed)]].map(([key, value]) => <View key={key} style={styles.row}><Text style={styles.label}>{key}</Text><Text style={styles.mono}>{value}</Text></View>)}{audit.warnings.map(w => <Text key={w} style={styles.warning}>⚠ {w}</Text>)}</View> : <Text style={styles.body}>No audit record yet.</Text>}</Card>
    <Card title="Why this matters" eyebrow="PRODUCT DESIGN"><View style={styles.stack}>{brief.whyItMatters.map(item => <Text key={item} style={styles.body}>✓ {item}</Text>)}</View></Card>
    <View style={styles.actions}><Button title="Back to results" kind="secondary" onPress={() => navigate('results')} /><Button title="Share proof brief" onPress={share} /></View>
    <Button title="Run another scenario" kind="secondary" onPress={() => navigate('scenario')} />
    <Card><Text style={styles.muted}>Available problem families: {useCases.map(u => u.domain).join(' · ')}</Text></Card>
  </View></Screen>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  narrative: { backgroundColor: '#0A2633', borderColor: '#2E6578' },
  headline: { ...typography.title, color: colors.text, marginVertical: 7 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  stack: { gap: 10 },
  compact: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { color: colors.text, fontWeight: '800', marginBottom: 3 },
  value: { color: colors.cyan, fontSize: 19, fontWeight: '900' },
  unit: { color: colors.muted, fontSize: 10 },
  label: { color: colors.text, fontSize: 10, fontWeight: '900' },
  muted: { color: colors.muted, fontSize: 11 },
  mono: { color: colors.cyan, fontFamily: 'Courier', fontSize: 10 },
  warning: { color: colors.amber, fontSize: 11, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 10 }
});
