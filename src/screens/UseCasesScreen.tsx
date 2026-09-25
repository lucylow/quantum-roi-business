import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useCases } from '../data/mock';
import type { ScreenName } from '../domain';
import { colors, spacing } from '../theme';
import { AppHeader } from '../components/Header';
import { Button, Card, Pill, Section } from '../components/Primitives';

export function UseCasesScreen({ navigate }: { navigate: (screen: ScreenName) => void }) {
  const { setSelectedProblem } = useApp();
  return <View style={styles.container}><AppHeader eyebrow="PROBLEM CATALOG" title="Four paths to value." subtitle="Each path uses the same product loop: model → baseline → optimize → explain → experiment." />
    <Section title="Featured problems"><View style={styles.list}>{useCases.map((item, i) => <Card key={item.id}><View style={styles.row}><Pill tone={i === 0 ? 'cyan' : i === 1 ? 'green' : i === 2 ? 'purple' : 'amber'}>{String(i + 1).padStart(2, '0')}</Pill><Text style={styles.title}>{item.name}</Text></View><Text style={styles.body}>{item.description}</Text><View style={styles.tags}>{item.tags.map(tag => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View><Button title="Build scenario" onPress={() => { setSelectedProblem(item); navigate('scenario'); }} /></Card>)}</View></Section>
    <Card><Text style={styles.quote}>“Work backwards from the problem.”</Text><Text style={styles.body}>The app deliberately separates the business formulation from the solver. That lets the same interface test classical methods, QUBO structure, and future quantum hardware without rewriting the business case.</Text></Card>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.xl },
  list: { gap: spacing.md },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  title: { color: colors.text, fontSize: 18, fontWeight: '900', flex: 1 },
  body: { color: colors.muted, lineHeight: 20, fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.surface2 },
  tagText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  quote: { color: colors.cyan, fontSize: 20, fontWeight: '900', marginBottom: 4 }
});
