import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../domain';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../theme';
import { AppHeader } from '../components/Header';
import { Screen, Button, Card, Pill, Section } from '../components/Primitives';
import { queueBraketExperiment } from '../services/braket';
import { buildDomainQubo } from '../core/quboDomain';
import { deliveryScenario, workforceScenario, portfolioScenario, robotScenario } from '../data/mock';

function scenarioDataFor(domain: string) {
  if (domain === 'delivery') return deliveryScenario;
  if (domain === 'workforce') return workforceScenario;
  if (domain === 'portfolio') return portfolioScenario;
  return robotScenario;
}

export function ExperimentScreen({ navigate }: { navigate: (screen: ScreenName) => void }) {
  const { selectedProblem, lastResult } = useApp();
  const [message, setMessage] = useState('');
  const qubo = buildDomainQubo(selectedProblem, scenarioDataFor(selectedProblem.domain));

  const queue = async () => {
    const response = await queueBraketExperiment({
      deviceArn: 'arn:aws:braket:us-east-1::device/qpu/ionq/Forte-1',
      shots: 1000,
      qubo,
      runId: lastResult?.runId ?? `draft_${Date.now()}`
    });
    setMessage(`${response.status.toUpperCase()}: ${response.message}`);
  };

  return <Screen><View style={styles.container}><AppHeader eyebrow="EXPERIMENT LAB" title="Bridge the app to quantum hardware." subtitle="The mobile app owns the experiment definition. Credentials, AWS IAM, S3, and Braket execution stay on the server boundary." badge="SAFE BY DESIGN" />
    <Card><View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.label}>TARGET MODEL</Text><Text style={styles.title}>{selectedProblem.name}</Text><Text style={styles.body}>{qubo.n} logical variables · {Object.keys(qubo.quadratic).length} interactions</Text></View><Pill tone="purple">QUBO</Pill></View></Card>
    <Section title="Execution path"><View style={styles.path}>{['Business problem', 'Classical baseline', 'QUBO / Ising', 'Braket simulator', 'QPU benchmark'].map((step, i) => <View key={step} style={styles.pathRow}><View style={[styles.circle, i < 3 && styles.circleActive]}><Text style={styles.circleText}>{i + 1}</Text></View><View style={{ flex: 1 }}><Text style={styles.stepTitle}>{step}</Text><Text style={styles.stepBody}>{i === 0 ? 'Define objective and constraints.' : i === 1 ? 'Keep a trusted comparison.' : i === 2 ? 'Expose the mathematical reduction.' : i === 3 ? 'Cheap controlled experiment.' : 'Measure device behavior.'}</Text></View></View>)}</View></Section>
    <Card title="What the server must provide" eyebrow="BRACKET ADAPTER"><View style={styles.list}>{['AWS IAM role with least-privilege Braket permissions', 'S3 output bucket / prefix for quantum-task results', 'Device ARN selected from current Braket availability', 'Task polling + timeout + failure handling', 'Postprocessing that returns business-level metrics'].map(item => <Text key={item} style={styles.body}>• {item}</Text>)}</View><Button title="Queue Braket benchmark" onPress={queue} /></Card>
    {message && <Card><Text style={styles.message}>{message}</Text></Card>}
    <Button title="Inspect mathematical model" kind="secondary" onPress={() => navigate('qubo')} />
  </View></Screen>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  title: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  path: { gap: 14 },
  pathRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  circle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface3, borderWidth: 1, borderColor: colors.border },
  circleActive: { backgroundColor: `${colors.cyan}22`, borderColor: colors.cyan },
  circleText: { color: colors.text, fontWeight: '900', fontSize: 11 },
  stepTitle: { color: colors.text, fontWeight: '800' },
  stepBody: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  list: { gap: 7 },
  message: { color: colors.cyan, fontSize: 12, lineHeight: 18, fontWeight: '700' }
});
