import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Pill } from './Primitives';

export function AppHeader({ eyebrow, title, subtitle, badge }: { eyebrow?: string; title: string; subtitle?: string; badge?: string }) {
  return <View style={styles.wrap}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>}<View style={styles.row}><Text style={styles.title}>{title}</Text>{badge && <Pill tone="cyan">{badge}</Pill>}</View>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>;
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  eyebrow: { ...typography.label, color: colors.cyan },
  title: { ...typography.display, color: colors.text, flex: 1 },
  subtitle: { ...typography.body, color: colors.muted, maxWidth: 620 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }
});
