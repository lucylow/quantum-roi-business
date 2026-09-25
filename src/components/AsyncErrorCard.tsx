import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from './Primitives';
import { colors } from '../theme';

export function AsyncErrorCard({ title, message, onRetry, busy = false }: { title: string; message: string; onRetry?: () => void; busy?: boolean }) {
  return (
    <Card>
      <View style={styles.stack}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry ? <Button title={busy ? 'Retrying…' : 'Retry'} kind="secondary" onPress={onRetry} disabled={busy} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 8 },
  title: { color: colors.text, fontWeight: '800', fontSize: 14 },
  message: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
