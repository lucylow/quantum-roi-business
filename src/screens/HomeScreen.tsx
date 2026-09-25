import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useCases, brief } from '../data/mock';
import { colors, spacing, typography } from '../theme';
import { AppHeader } from '../components/Header';
import { Button, Card, MetricTile, Pill, Section } from '../components/Primitives';
import type { ScreenName } from '../domain';

export function HomeScreen({ navigate }: { navigate: (screen: ScreenName) => void }) {
  const { experiments, setSelectedProblem } = useApp();
  const delivery = useCases[0];
  return <View style={styles.container}>
    <AppHeader eyebrow="QUANTUM ROI · DECISION LAB" title="Make the hard decision visible." subtitle={brief.subhead} badge="POC" />
    <Card style={styles.hero}>
      <View style={styles.heroTop}><View style={{ flex: 1 }}><Pill tone="cyan">BUSINESS-FIRST</Pill><Text style={styles.heroTitle}>Optimization before quantum.</Text><Text style={styles.heroBody}>{brief.impact}</Text></View><Text style={styles.qmark}>Q</Text></View>
      <Button title="Run a delivery network experiment" onPress={() => { setSelectedProblem(delivery); navigate('scenario'); }} />
    </Card>
    <Section title="What the lab measures">
      <View style={styles.metrics}><MetricTile label="Classical baseline" value="1" unit="path" /><MetricTile label="Decision variables" value="24" /><MetricTile label="Business outputs" value="4+" /></View>
    </Section>
    <Section title="Use cases from the talk" accessory={<Button title="View all" kind="ghost" onPress={() => navigate('useCases')} />}>
      <View style={styles.grid}>{useCases.map((item) => <Card key={item.id} style={styles.mini}><Pill tone={item.domain === 'delivery' ? 'cyan' : item.domain === 'workforce' ? 'green' : item.domain === 'portfolio' ? 'purple' : 'amber'}>{item.domain}</Pill><Text style={styles.miniTitle}>{item.name}</Text><Text style={styles.miniText}>{item.description}</Text><Button title="Open" kind="secondary" onPress={() => { setSelectedProblem(item); navigate('scenario'); }} /></Card>)}</View>
    </Section>
    <Section title="Recent experiments"><Text style={styles.muted}>{experiments.length ? `${experiments.length} saved experiment${experiments.length === 1 ? '' : 's'}.` : 'No saved experiments yet. Your first run becomes the case study.'}</Text></Section>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.xl },
  hero: { backgroundColor: '#0B2132', borderColor: '#2F6E87', minHeight: 235, justifyContent: 'space-between' },
  heroTop: { flexDirection: 'row', gap: spacing.lg },
  heroTitle: { color: colors.text, fontSize: 28, lineHeight: 33, fontWeight: '900', marginTop: 12 },
  heroBody: { color: colors.muted, lineHeight: 21, marginTop: 8, maxWidth: 540 },
  qmark: { color: `${colors.cyan}55`, fontSize: 90, lineHeight: 90, fontWeight: '900' },
  metrics: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  grid: { gap: spacing.md },
  mini: { gap: 10, padding: spacing.md },
  miniTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  miniText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  muted: { color: colors.muted, ...typography.body }
});
