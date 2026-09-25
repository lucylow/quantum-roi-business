import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Primitives';
import { colors, spacing, typography } from '../theme';
import { recordError, sanitizeError } from '../platform/errorReporting';

interface Props { children: React.ReactNode }
interface State { hasError: boolean; message: string }

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: sanitizeError(error) };
  }

  componentDidCatch(error: unknown): void {
    recordError(error, { scope: 'react-render', operation: 'componentDidCatch' });
  }

  private recover = (): void => {
    this.setState({ hasError: false, message: '' });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container} accessibilityRole="alert">
        <Text style={styles.eyebrow}>SAFE RECOVERY</Text>
        <Text style={styles.title}>Quantum ROI hit an unexpected screen error.</Text>
        <Text style={styles.body}>Your saved app state is kept in memory. Retry the screen before restarting the app.</Text>
        <View style={styles.errorBox}>
          <Text style={styles.errorLabel}>TECHNICAL MESSAGE</Text>
          <Text style={styles.errorText}>{this.state.message || 'Unexpected rendering error.'}</Text>
        </View>
        <Button title="Try again" onPress={this.recover} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center', gap: spacing.md },
  eyebrow: { ...typography.label, color: colors.cyan },
  title: { ...typography.display, color: colors.text, fontSize: 28, lineHeight: 34 },
  body: { ...typography.body, color: colors.muted, lineHeight: 21 },
  errorBox: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: spacing.md, gap: 5 },
  errorLabel: { ...typography.label, color: colors.muted },
  errorText: { ...typography.body, color: colors.text },
});
