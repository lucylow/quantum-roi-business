import { Dimensions } from 'react-native';

export const colors = {
  bg: '#07111F',
  surface: '#0D1B2A',
  surface2: '#11263A',
  surface3: '#163149',
  border: '#23445F',
  text: '#F4F8FB',
  muted: '#8CA4B7',
  blue: '#66B9FF',
  cyan: '#58E6D0',
  purple: '#9E8CFF',
  amber: '#F5C76A',
  red: '#FF7184',
  green: '#71E2A2',
  white: '#FFFFFF'
};

export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30, xxl: 42 };
export const radii = { sm: 10, md: 16, lg: 22, pill: 999 };
export const width = Dimensions.get('window').width;

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.8 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800' as const },
  heading: { fontSize: 17, lineHeight: 23, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '500' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const, letterSpacing: 0.3 },
  mono: { fontSize: 12, lineHeight: 17, fontWeight: '600' as const, fontFamily: 'Courier' }
};
