import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Decision } from '../domain';
import { colors, radii, spacing } from '../theme';

export function DecisionList({ decisions, limit = 10 }: { decisions: Decision[]; limit?: number }) {
  return <View style={styles.list}>{decisions.slice(0, limit).map((decision, index) => <View key={decision.id} style={styles.row}><View style={[styles.rank, { opacity: 1 - index * 0.045 }]}><Text style={styles.rankText}>{index + 1}</Text></View><View style={styles.main}><Text style={styles.label}>{decision.label}</Text>{decision.metadata && <Text style={styles.meta}>{Object.entries(decision.metadata).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ')}</Text>}</View><View style={[styles.status, decision.selected ? styles.selected : styles.rejected]}><Text style={styles.statusText}>{decision.selected ? 'ON' : 'OFF'}</Text></View></View>)}</View>;
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: colors.surface2, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  rank: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  main: { flex: 1, gap: 2 },
  label: { color: colors.text, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  status: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  selected: { backgroundColor: `${colors.green}12`, borderColor: `${colors.green}44` },
  rejected: { backgroundColor: `${colors.red}12`, borderColor: `${colors.red}44` },
  statusText: { color: colors.text, fontSize: 9, fontWeight: '900' }
});
