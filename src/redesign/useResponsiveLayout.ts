import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayout {
  width: number;
  isTablet: boolean;
  isWide: boolean;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width } = useWindowDimensions();
  return {
    width,
    isTablet: width >= 560,
    isWide: width >= 760,
  };
}
