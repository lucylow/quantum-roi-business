import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from './Primitives';
import { colors } from '../theme';
import { checkAppReviewReadiness } from '../platform/appReviewReadiness';

export function ReleaseGateCard({ onReview }: { onReview?: () => void }) {
  const state = checkAppReviewReadiness();
  return (
    <Card title="Submission gate" eyebrow="STORE BUILD">
      <View style={styles.stack}>
        <View style={styles.summary}>
          <View style={[styles.dot, state.pass ? styles.pass : styles.blocked]} />
          <Text style={styles.summaryText}>{state.pass ? 'No runtime blockers detected.' : `${state.blockers.length} blocker(s) require attention.`}</Text>
        </View>
        {state.blockers.map(item => <Text key={item} style={styles.blockedText}>• {item}</Text>)}
        {state.warnings.map(item => <Text key={item} style={styles.warningText}>• {item}</Text>)}
        {onReview ? <Button title="Review release diagnostics" kind="secondary" onPress={onReview} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 8 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 8 },
  pass: { backgroundColor: colors.green },
  blocked: { backgroundColor: colors.red },
  summaryText: { color: colors.text, fontWeight: '800' },
  blockedText: { color: colors.red, fontSize: 11, lineHeight: 17 },
  warningText: { color: colors.amber, fontSize: 11, lineHeight: 17 },
});
