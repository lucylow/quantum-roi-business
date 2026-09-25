import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const content = <View style={styles.screen}>{children}</View>;
  return scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content;
}

export function Card({ children, title, eyebrow, action, style }: { children: React.ReactNode; title?: string; eyebrow?: string; action?: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      {(eyebrow || title || action) && (
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            {eyebrow && <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>}
            {title && <Text style={styles.cardTitle}>{title}</Text>}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

export function Pill({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'cyan' | 'amber' | 'purple' | 'green' | 'red' }) {
  const toneColor = colors[tone];
  return <View style={[styles.pill, { borderColor: `${toneColor}55`, backgroundColor: `${toneColor}12` }]}><View style={[styles.pillDot, { backgroundColor: toneColor }]} /><Text style={[styles.pillText, { color: toneColor }]}>{children}</Text></View>;
}

export function Button({ title, onPress, kind = 'primary', disabled = false }: { title: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [
      styles.button,
      kind === 'primary' && styles.buttonPrimary,
      kind === 'secondary' && styles.buttonSecondary,
      kind === 'ghost' && styles.buttonGhost,
      pressed && styles.pressed,
      disabled && styles.disabled
    ]}>
      <Text style={[styles.buttonText, kind === 'primary' ? { color: colors.bg } : { color: colors.text }]}>{title}</Text>
    </Pressable>
  );
}

export function MetricTile({ label, value, unit, delta, positive = true }: { label: string; value: string; unit?: string; delta?: string; positive?: boolean }) {
  return <View style={styles.metricTile}><Text style={styles.eyebrow}>{label.toUpperCase()}</Text><View style={styles.metricRow}><Text style={styles.metricValue}>{value}</Text>{unit && <Text style={styles.metricUnit}>{unit}</Text>}</View>{delta && <Text style={{ color: positive ? colors.green : colors.red, marginTop: 5, fontWeight: '700' }}>{delta}</Text>}</View>;
}

export function ProgressBar({ value, label, caption }: { value: number; label?: string; caption?: string }) {
  return <View style={{ gap: 7 }}>{(label || caption) && <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.muted}>{caption}</Text></View>}<View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(0, Math.min(1, value)) * 100}%` }]} /></View></View>;
}

export function Section({ title, children, accessory }: { title: string; children: React.ReactNode; accessory?: React.ReactNode }) {
  return <View style={styles.section}><View style={styles.row}><Text style={styles.sectionTitle}>{title}</Text>{accessory}</View>{children}</View>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <View style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.muted}>{body}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  scroll: { flexGrow: 1, backgroundColor: colors.bg, paddingBottom: 110 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardTitle: { ...typography.heading, color: colors.text },
  eyebrow: { ...typography.label, color: colors.muted, marginBottom: 5 },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill, borderWidth: 1 },
  pillDot: { width: 6, height: 6, borderRadius: 6 },
  pillText: { fontSize: 11, fontWeight: '800' },
  button: { minHeight: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 12, borderWidth: 1 },
  buttonPrimary: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  buttonSecondary: { backgroundColor: colors.surface2, borderColor: colors.border },
  buttonGhost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  buttonText: { ...typography.body, fontWeight: '800' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  metricTile: { flex: 1, minWidth: 140, backgroundColor: colors.surface2, borderRadius: radii.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  metricRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  metricValue: { fontSize: 27, lineHeight: 32, fontWeight: '900', color: colors.text },
  metricUnit: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  label: { color: colors.text, fontSize: 12, fontWeight: '700' },
  muted: { color: colors.muted, ...typography.body },
  progressTrack: { height: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surface3 },
  progressFill: { height: '100%', borderRadius: 8, backgroundColor: colors.cyan },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.heading, color: colors.text },
  empty: { padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg },
  emptyTitle: { ...typography.heading, color: colors.text }
});
