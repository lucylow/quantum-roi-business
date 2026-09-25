import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { compareSolvers } from '../core/optimizer';
import type { OptimizationInput, ScreenName } from '../domain';
import { deliveryScenario, workforceScenario, portfolioScenario, robotScenario } from '../data/mock';
import { colors, spacing } from '../theme';
import { AppHeader } from '../components/Header';
import { Screen, Button, Card, Pill, Section } from '../components/Primitives';

function scenarioData(domain: string) {
  switch (domain) { case 'delivery': return deliveryScenario; case 'workforce': return workforceScenario; case 'portfolio': return portfolioScenario; default: return robotScenario; }
}

export function CompareScreen({ navigate }: { navigate: (screen: ScreenName) => void }) {
  const { selectedProblem } = useApp();
  const input: OptimizationInput = useMemo(() => ({ problem: selectedProblem, solver: 'rko', seed: 42, iterations: 20, scenarioData: scenarioData(selectedProblem.domain) }), [selectedProblem]);
  const results = useMemo(() => compareSolvers(input), [input]);
  const baseline = results[0]?.baselineObjective ?? 0;

  return <Screen><View style={styles.container}><AppHeader eyebrow="SOLVER COMPARISON" title="Same problem. Different search engines." subtitle="A credible optimization conversation needs the model held constant while solver choices vary." badge="BENCHMARK" />
    <Section title="Comparison"><View style={styles.stack}>{results.map(result => <Card key={result.runId}><View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.title}>{result.solver}</Text><Text style={styles.muted}>{result.durationMs} ms · {result.trace.length} trace points</Text></View><Pill tone={result.solver === 'quantumMock' ? 'purple' : 'cyan'}>{result.objective.toFixed(1)}</Pill></View><View style={styles.bar}><View style={[styles.fill, { width: `${Math.min(100, Math.max(8, Math.abs(result.objective / Math.max(1, baseline)) * 100))}%` }]} /></View><Text style={styles.muted}>{result.violations.length ? `${result.violations.length} violation(s)` : 'Feasible under modeled constraints'}</Text></Card>)}</View></Section>
    <Card title="How to interpret this" eyebrow="METHOD"><Text style={styles.body}>Do not compare raw objective numbers across differently formulated problems. Compare solver quality, feasibility, runtime, stability across seeds, and ultimately the business KPI that the organization cares about.</Text></Card>
    <Button title="Back to experiment lab" onPress={() => navigate('experiment')} />
  </View></Screen>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  stack: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: colors.text, fontSize: 16, fontWeight: '900' },
  muted: { color: colors.muted, fontSize: 11 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  bar: { height: 8, borderRadius: 8, backgroundColor: colors.surface3, overflow: 'hidden', marginTop: 10 },
  fill: { height: '100%', backgroundColor: colors.cyan, borderRadius: 8 }
});
