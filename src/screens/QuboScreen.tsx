import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../domain';
import { useApp } from '../context/AppContext';
import { buildDomainQubo } from '../core/quboDomain';
import { quboToIsing } from '../core/qubo';
import { deliveryScenario, workforceScenario, portfolioScenario, robotScenario } from '../data/mock';
import { colors, spacing } from '../theme';
import { AppHeader } from '../components/Header';
import { Screen, Button, Card, Pill, Section } from '../components/Primitives';

function scenarioData(domain: string) {
  if (domain === 'delivery') return deliveryScenario;
  if (domain === 'workforce') return workforceScenario;
  if (domain === 'portfolio') return portfolioScenario;
  return robotScenario;
}

export function QuboScreen({ navigate }: { navigate: (screen: ScreenName) => void }) {
  const { selectedProblem } = useApp();
  const model = useMemo(() => buildDomainQubo(selectedProblem, scenarioData(selectedProblem.domain)), [selectedProblem]);
  const ising = useMemo(() => quboToIsing(model), [model]);
  const linearSample = model.linear.slice(0, 10);
  const quadraticSample = Object.entries(model.quadratic).slice(0, 12);
  return <Screen><View style={styles.container}><AppHeader eyebrow="MATHEMATICAL MODEL" title="See the optimization, not just the score." subtitle="This screen is the proof layer: binary variables, couplings, constraints, and the QUBO → Ising transformation are inspectable." badge="QUBO" />
    <View style={styles.metrics}><Card style={styles.metric}><Text style={styles.big}>{model.n}</Text><Text style={styles.small}>LOGICAL VARIABLES</Text></Card><Card style={styles.metric}><Text style={styles.big}>{Object.keys(model.quadratic).length}</Text><Text style={styles.small}>PAIRWISE TERMS</Text></Card><Card style={styles.metric}><Text style={styles.big}>{model.constraints.length}</Text><Text style={styles.small}>CONSTRAINTS</Text></Card></View>
    <Section title="Variable encoding"><Card><View style={styles.codeBox}><Text style={styles.code}>xᵢ ∈ {'{0, 1}'}{`\n`}H(x) = xᵀQx{`\n`}zᵢ = 1 − 2xᵢ{`\n`}H(z) = ΣJᵢⱼzᵢzⱼ + Σhᵢzᵢ + offset</Text></View><Text style={styles.body}>The talk emphasizes QUBO / Ising as the quantum-native formulation accepted by quantum annealing or hybrid QAOA workflows. This app keeps the reduction explicit so a technical reviewer can trace decisions back to the business model.</Text></Card></Section>
    <Section title="Linear coefficients"><Card>{linearSample.map((value, index) => <View key={index} style={styles.tableRow}><Text style={styles.key}>{model.variableLabels[index]}</Text><Text style={styles.value}>{value.toFixed(3)}</Text></View>)}</Card></Section>
    <Section title="Quadratic interactions"><Card>{quadraticSample.map(([key, value]) => <View key={key} style={styles.tableRow}><Text style={styles.key}>{key}</Text><Text style={styles.value}>{value.toFixed(3)}</Text></View>)}</Card></Section>
    <Card title="Ising conversion" eyebrow="DERIVED"><Text style={styles.body}>h terms: {ising.h.slice(0, 8).map(v => v.toFixed(2)).join(', ')}{ising.h.length > 8 ? ' …' : ''}</Text><Text style={styles.body}>J terms: {Object.keys(ising.J).length}</Text><Text style={styles.body}>Offset: {ising.offset.toFixed(3)}</Text><Pill tone="purple">TRACEABLE</Pill></Card>
    <Button title="Back to experiment lab" onPress={() => navigate('experiment')} />
  </View></Screen>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, alignItems: 'center', padding: 12, gap: 4 },
  big: { color: colors.text, fontSize: 23, fontWeight: '900' },
  small: { color: colors.muted, fontSize: 8, fontWeight: '900', textAlign: 'center' },
  codeBox: { backgroundColor: '#05101B', borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  code: { color: colors.cyan, fontFamily: 'Courier', fontSize: 13, lineHeight: 21 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 8 },
  key: { color: colors.muted, fontFamily: 'Courier', fontSize: 11 },
  value: { color: colors.text, fontFamily: 'Courier', fontSize: 11, fontWeight: '800' }
});
