import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SolverTrace } from '../domain';
import { colors, spacing } from '../theme';

export function TraceChart({ trace }: { trace: SolverTrace[] }) {
  const sample = trace.filter((_, i) => i === 0 || i === trace.length - 1 || i % Math.max(1, Math.floor(trace.length / 8)) === 0).slice(0, 10);
  const values = sample.map((p) => p.bestObjective);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = Math.max(1e-9, max - min);
  return <View style={styles.wrap}><View style={styles.header}><Text style={styles.title}>Solver convergence</Text><Text style={styles.caption}>{trace.length} iterations</Text></View><View style={styles.chart}>{sample.map((point, index) => { const x = `${(index / Math.max(1, sample.length - 1)) * 100}%` as `${number}%`; const y = `${92 - ((point.bestObjective - min) / range) * 76}%` as `${number}%`; return <View key={`${point.step}-${index}`} style={[styles.dot, { left: x, top: y }]}><View style={styles.dotCore} /></View>; })}</View><View style={styles.footer}><Text style={styles.caption}>start {values[0]?.toFixed(1) ?? '—'}</Text><Text style={styles.caption}>best {values[values.length - 1]?.toFixed(1) ?? '—'}</Text></View></View>;
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface2, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { color: colors.text, fontWeight: '800' },
  caption: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  chart: { height: 120, position: 'relative', borderBottomWidth: 1, borderLeftWidth: 1, borderColor: colors.border },
  dot: { position: 'absolute', width: 18, height: 18, marginLeft: -9, marginTop: -9, alignItems: 'center', justifyContent: 'center' },
  dotCore: { width: 8, height: 8, borderRadius: 8, backgroundColor: colors.cyan, borderWidth: 2, borderColor: colors.bg },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }
});
