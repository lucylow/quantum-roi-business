import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { OptimizationInput, ScreenName, SolverKind } from '../domain';
import { colors, spacing } from '../theme';
import { useApp } from '../context/AppContext';
import { deliveryScenario, workforceScenario, portfolioScenario, robotScenario } from '../data/mock';
import { AppHeader } from '../components/Header';
import { Button, Card, Pill, ProgressBar, Section } from '../components/Primitives';
import { useOptimization } from '../hooks/useOptimization';

function dataForDomain(domain: OptimizationInput['problem']['domain']) {
  if (domain === 'delivery') return deliveryScenario;
  if (domain === 'workforce') return workforceScenario;
  if (domain === 'portfolio') return portfolioScenario;
  return robotScenario;
}

export function ScenarioScreen({ navigate }: { navigate: (screen: ScreenName) => void }) {
  const { selectedProblem, setLastResult, saveExperiment } = useApp();
  const { run, busy, error } = useOptimization();
  const [solver, setSolver] = useState<SolverKind>('rko');
  const [iterations, setIterations] = useState(30);
  const [seed, setSeed] = useState(42);

  const input = useMemo<OptimizationInput>(() => ({
    problem: selectedProblem,
    solver,
    seed,
    iterations,
    scenarioData: dataForDomain(selectedProblem.domain)
  }), [selectedProblem, solver, seed, iterations]);

  const execute = async () => {
    const result = await run(input);
    setLastResult(result);
    saveExperiment({ id: result.runId, createdAt: new Date().toISOString(), scenarioName: selectedProblem.name, domain: selectedProblem.domain, solver: result.solver, result });
    navigate('results');
  };

  return <View style={styles.container}><AppHeader eyebrow="SCENARIO BUILDER" title={selectedProblem.name} subtitle={selectedProblem.description} badge={selectedProblem.domain} />
    <Card><View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.label}>OBJECTIVE</Text><Text style={styles.objective}>{selectedProblem.objective}</Text></View><Pill tone="cyan">{selectedProblem.direction.toUpperCase()}</Pill></View></Card>
    <Section title="Solver strategy"><View style={styles.solverGrid}>{(['rko', 'simulatedAnnealing', 'greedy', 'quantumMock'] as SolverKind[]).map(option => <Button key={option} title={option === 'rko' ? 'RKO' : option === 'simulatedAnnealing' ? 'Annealing' : option === 'greedy' ? 'Greedy' : 'Quantum mock'} kind={solver === option ? 'primary' : 'secondary'} onPress={() => setSolver(option)} />)}</View></Section>
    <Card title="Experiment controls" eyebrow="REPRODUCIBILITY"><View style={styles.control}><Text style={styles.controlTitle}>Iterations</Text><View style={styles.stepper}><Button title="−" kind="secondary" onPress={() => setIterations(v => Math.max(10, v - 10))}/><Text style={styles.number}>{iterations}</Text><Button title="+" kind="secondary" onPress={() => setIterations(v => Math.min(120, v + 10))}/></View></View><ProgressBar value={iterations / 120} label="Search budget" caption={`${iterations}/120`} /><View style={styles.control}><Text style={styles.controlTitle}>Seed</Text><View style={styles.stepper}><Button title="−" kind="secondary" onPress={() => setSeed(v => Math.max(1, v - 1))}/><Text style={styles.number}>{seed}</Text><Button title="+" kind="secondary" onPress={() => setSeed(v => v + 1)}/></View></View></Card>
    <Card title="Constraints" eyebrow="ACTIVE"><View style={{ gap: 9 }}>{selectedProblem.constraints.filter(c => c.enabled).map(c => <View key={c.id} style={styles.constraint}><View style={[styles.dot, { backgroundColor: c.type === 'hard' ? colors.red : colors.amber }]} /><View style={{ flex: 1 }}><Text style={styles.ctitle}>{c.label}</Text><Text style={styles.cbody}>{c.description}</Text></View><Text style={styles.penalty}>{c.type}</Text></View>)}</View></Card>
    {error && <Card><Text style={{ color: colors.red, fontWeight: '800' }}>Run error</Text><Text style={{ color: colors.muted }}>{error}</Text></Card>}
    <Button title={busy ? 'Running optimization…' : `Run ${solver === 'quantumMock' ? 'quantum-style' : 'classical'} experiment`} onPress={execute} disabled={busy} />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  label: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  objective: { color: colors.text, fontWeight: '800', fontSize: 16, lineHeight: 22, marginTop: 4 },
  solverGrid: { gap: 9 },
  control: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  controlTitle: { color: colors.text, fontWeight: '800' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  number: { minWidth: 46, textAlign: 'center', color: colors.text, fontSize: 16, fontWeight: '900' },
  constraint: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 8, marginTop: 5 },
  ctitle: { color: colors.text, fontWeight: '800', fontSize: 13 },
  cbody: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  penalty: { color: colors.muted, fontSize: 9, textTransform: 'uppercase', fontWeight: '900' }
});
