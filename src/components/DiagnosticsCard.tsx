import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { collectDiagnostics } from '../platform/diagnostics';
import { Card } from './Primitives';

export function DiagnosticsCard() {
  const diagnostics = collectDiagnostics();
  return (
    <Card title="Release diagnostics" eyebrow="APP STORE READINESS">
      <View style={styles.stack}>
        {diagnostics.map(item => (
          <View key={item.id} style={styles.row}>
            <View style={[styles.dot, item.status === 'pass' ? styles.pass : item.status === 'warn' ? styles.warn : styles.blocked]} />
            <View style={styles.text}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 8, marginTop: 5 },
  pass: { backgroundColor: colors.green },
  warn: { backgroundColor: colors.amber },
  blocked: { backgroundColor: colors.red },
  text: { flex: 1, gap: 2 },
  label: { color: colors.text, fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 11, lineHeight: 16 },
});
