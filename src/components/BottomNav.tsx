import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../domain';
import { colors } from '../theme';

const items: Array<{ id: ScreenName; label: string; glyph: string }> = [
  { id: 'home', label: 'Home', glyph: '⌂' },
  { id: 'useCases', label: 'Use cases', glyph: '◫' },
  { id: 'results', label: 'Results', glyph: '↗' },
  { id: 'insights', label: 'Insights', glyph: '✦' },
  { id: 'experiment', label: 'Lab', glyph: '◈' },
  { id: 'settings', label: 'Settings', glyph: '⚙' }
];

export function BottomNav({ current, onNavigate }: { current: ScreenName; onNavigate: (screen: ScreenName) => void }) {
  return <View style={styles.bar}>{items.map((item) => { const active = current === item.id; return <Pressable key={item.id} onPress={() => onNavigate(item.id)} style={styles.item}><View style={[styles.icon, active && styles.activeIcon]}><Text style={[styles.glyph, active && { color: colors.bg }]}>{item.glyph}</Text></View><Text style={[styles.label, active && { color: colors.text }]}>{item.label}</Text></Pressable>; })}</View>;
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 12, right: 12, bottom: 12, borderRadius: 22, backgroundColor: '#0C1825EE', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  item: { alignItems: 'center', gap: 3, flex: 1 },
  icon: { width: 34, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  activeIcon: { backgroundColor: colors.cyan },
  glyph: { color: colors.muted, fontSize: 18, fontWeight: '800' },
  label: { color: colors.muted, fontSize: 9, fontWeight: '700' }
});
