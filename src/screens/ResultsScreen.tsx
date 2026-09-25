import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../domain';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography } from '../theme';
import { AppHeader } from '../components/Header';
import { Screen, Button, Card, MetricTile, Pill, Section } from '../components/Primitives';
import { ReadinessCard } from '../components/ReadinessCard';
import { TraceChart } from '../components/TraceChart';
import { DecisionList } from '../components/DecisionList';
import { formatCurrency } from '../core/math';

export function ResultsScreen({ navigate }: { navigate: (screen: ScreenName) => void }) {
  const { lastResult } = useApp();
  if (!lastResult) return <Screen><View style={styles.container}><AppHeader eyebrow="RESULTS" title="No experiment yet." subtitle="Run a scenario to populate the decision record."/><Button title="Open use cases" onPress={() => navigate('useCases')} /></View></Screen>;
  const objectiveDelta = lastResult.baselineObjective === 0 ? 0 : ((lastResult.objective - lastResult.baselineObjective) / Math.abs(lastResult.baselineObjective)) * 100;
  const businessValue = lastResult.metrics.find(m => m.id === 'economic-value')?.value ?? (lastResult.metrics.find(m => m.id === 'delivery-cost')?.improvement ?? 0) * 1000;
  return <Screen><View style={styles.container}><AppHeader eyebrow="EXPERIMENT COMPLETE" title="The result is a business decision." subtitle={`${lastResult.runId} · ${lastResult.durationMs} ms · ${lastResult.solver}`} badge={lastResult.status === 'fallback' ? 'LOCAL FALLBACK' : 'COMPLETE'} />
    <View style={styles.metricGrid}>{lastResult.metrics.slice(0, 4).map(metric => <MetricTile key={metric.id} label={metric.label} value={Math.abs(metric.value) >= 1000 ? formatCurrency(metric.value) : metric.value.toFixed(metric.unit === '%' ? 1 : 0)} unit={metric.unit} delta={metric.improvement !== undefined ? `${metric.improvement >= 0 ? '+' : ''}${metric.improvement.toFixed(1)}% vs baseline` : undefined} positive={(metric.improvement ?? 0) >= 0} />)}</View>
    <Card style={styles.impact}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>IMPACT TRANSLATION</Text><Text style={styles.impactTitle}>{businessValue > 100 ? `${formatCurrency(businessValue)} annualized lens` : 'Translate the objective into an economic KPI'}</Text><Text style={styles.muted}>The lab intentionally connects mathematical objective changes to operating cost, service, staffing, risk, or throughput metrics.</Text></View><Pill tone={objectiveDelta < 0 ? 'green' : 'cyan'}>{objectiveDelta < 0 ? 'Improved' : 'Changed'}</Pill></Card>
    <ReadinessCard readiness={lastResult.quantumReadiness} />
    <Section title="Convergence"><TraceChart trace={lastResult.trace} /></Section>
    <Section title="Decision set"><DecisionList decisions={lastResult.decisions} /></Section>
    <Card title="Constraint audit" eyebrow="FEASIBILITY">{lastResult.violations.length ? <View style={{ gap: 8 }}>{lastResult.violations.map(v => <Text key={v} style={styles.violation}>● {v}</Text>)}</View> : <Text style={styles.success}>✓ All modeled constraints satisfied in the returned plan.</Text>}</Card>
    <View style={styles.actions}><Button title="Inspect QUBO" kind="secondary" onPress={() => navigate('qubo')} /><Button title="Open experiment lab" onPress={() => navigate('experiment')} /></View><View style={styles.actions}><Button title="Executive insight" kind="secondary" onPress={() => navigate('insights')} /><Button title="Compare solvers" kind="secondary" onPress={() => navigate('compare')} /></View>
  </View></Screen>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  impact: { flexDirection: 'row', backgroundColor: '#0F2A31', borderColor: '#2B6461' },
  eyebrow: { ...typography.label, color: colors.muted },
  impactTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginVertical: 5 },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  violation: { color: colors.red, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  success: { color: colors.green, fontSize: 13, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10 },
});
