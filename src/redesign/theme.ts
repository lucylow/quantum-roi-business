import { Platform } from 'react-native';

export const ui = {
  colors: {
    canvas: '#07111F',
    canvasElevated: '#091827',
    surface: '#0D1A28',
    surfaceRaised: '#112438',
    surfaceAlt: '#162E45',
    line: '#24445E',
    lineSoft: '#17334A',
    text: '#F6FAFD',
    text2: '#C1D0DC',
    text3: '#7F9AAF',
    blue: '#5BB8FF',
    blueSoft: '#2A7FBE',
    cyan: '#55E4D0',
    violet: '#9C88FF',
    green: '#6BE3A0',
    amber: '#F3C768',
    red: '#FF7385',
    white: '#FFFFFF',
  },
  spacing: { 2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 18: 18, 20: 20, 24: 24, 28: 28, 32: 32 },
  radius: { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 },
  shadow: Platform.OS === 'ios' ? { shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } } : { elevation: 5 },
  type: {
    display: { fontSize: 30, lineHeight: 36, fontWeight: '900' as const, letterSpacing: -0.8 },
    title: { fontSize: 23, lineHeight: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
    h2: { fontSize: 18, lineHeight: 24, fontWeight: '800' as const },
    h3: { fontSize: 15, lineHeight: 20, fontWeight: '800' as const },
    body: { fontSize: 13, lineHeight: 19, fontWeight: '500' as const },
    bodyStrong: { fontSize: 13, lineHeight: 19, fontWeight: '700' as const },
    label: { fontSize: 10, lineHeight: 14, fontWeight: '800' as const, letterSpacing: 0.7 },
    mono: { fontSize: 10, lineHeight: 15, fontWeight: '700' as const, fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) },
  },
};

export type Tone = 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'violet' | 'neutral';
export const toneColor = (tone: Tone) => ui.colors[tone === 'neutral' ? 'text3' : tone];
