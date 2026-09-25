import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function OfflineNotice({ message = 'Remote services are optional. Local optimization remains available.' }: { message?: string }) {
  return (
    <View style={styles.notice} accessibilityRole="text">
      <View style={styles.dot} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: `${colors.amber}55`, backgroundColor: `${colors.amber}0E`, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  dot: { width: 7, height: 7, borderRadius: 7, backgroundColor: colors.amber },
  text: { flex: 1, color: colors.muted, fontSize: 11, lineHeight: 16 },
});
