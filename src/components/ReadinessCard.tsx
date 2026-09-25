import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import type { QuantumReadiness } from '../domain';
import { colors, spacing } from '../theme';
import { Pill, ProgressBar } from './Primitives';

export function ReadinessCard({ readiness }: { readiness: QuantumReadiness }) {
  const tone = readiness.category === 'strong candidate' ? 'cyan' : readiness.category === 'promising' ? 'green' : readiness.category === 'exploratory' ? 'amber' : 'purple';
  return <View style={styles.card}><View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>QUANTUM READINESS</Text><Text style={styles.title}>{readiness.category}</Text></View><Pill tone={tone}>{readiness.score}/100</Pill></View><ProgressBar value={readiness.score / 100} /><Text style={styles.body}>{readiness.recommendedNextStep}</Text><View style={styles.metaRow}><View><Text style={styles.metaLabel}>LOGICAL</Text><Text style={styles.metaValue}>{readiness.qubitsEstimate}</Text></View><View><Text style={styles.metaLabel}>EST. EMBEDDING</Text><Text style={styles.metaValue}>{readiness.embeddingOverhead}×</Text></View></View></View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  eyebrow: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 2 },
  body: { color: colors.muted, lineHeight: 20, fontSize: 13 },
  metaRow: { flexDirection: 'row', gap: 30 },
  metaLabel: { color: colors.muted, fontSize: 9, fontWeight: '800' },
  metaValue: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 3 }
});
