import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Primitives';
import { colors } from '../theme';
import { getNetworkPolicy } from '../platform/networkPolicy';

export function NetworkPolicyCard() {
  const policy = getNetworkPolicy();
  const color = !policy.allowed ? colors.red : policy.mode === 'remote' ? colors.green : colors.amber;
  return (
    <Card title="Network policy" eyebrow="RUNTIME">
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <View style={styles.copy}>
          <Text style={styles.title}>{policy.mode === 'remote' ? 'Remote API available' : 'Local-first mode'}</Text>
          <Text style={styles.body}>{policy.reason}</Text>
          {policy.endpoint ? <Text style={styles.endpoint}>{policy.endpoint}</Text> : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 8, marginTop: 5 },
  copy: { flex: 1, gap: 3 },
  title: { color: colors.text, fontWeight: '800' },
  body: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  endpoint: { color: colors.cyan, fontFamily: 'Courier', fontSize: 10, marginTop: 2 },
});
