import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { OptimizationInput, ScreenName, SolverKind } from '../../domain';
import { useApp } from '../../context/AppContext';
import { deliveryScenario, workforceScenario, portfolioScenario, robotScenario } from '../../data/mock';
import { useOptimization } from '../../hooks/useOptimization';
import { AppPage, Body, Button, DataRow, Eyebrow, ErrorState, Pill, Progress, Section, Segmented, Surface, Title } from '../components/ui';
import { ConstraintInspector, SolverTable, TopBar } from '../components/enterprise';
import { ui } from '../theme';
import { useResponsiveLayout } from '../useResponsiveLayout';

const dataFor = (domain: OptimizationInput['problem']['domain']) => domain === 'delivery' ? deliveryScenario : domain === 'workforce' ? workforceScenario : domain === 'portfolio' ? portfolioScenario : robotScenario;

export function WorkbenchScreen({ navigate }:{navigate:(s:ScreenName)=>void}) {
  const { selectedProblem, setLastResult, saveExperiment } = useApp();
  const { run, busy, error } = useOptimization();
  const { isTablet } = useResponsiveLayout();
  const [solver, setSolver] = useState<SolverKind>('rko');
  const [iterations, setIterations] = useState(30);
  const [seed, setSeed] = useState(42);
  const input = useMemo<OptimizationInput>(() => ({ problem: selectedProblem, solver, seed, iterations, scenarioData: dataFor(selectedProblem.domain) }), [selectedProblem, solver, seed, iterations]);

  const execute = async () => {
    if (busy) return;
    try {
      const result = await run(input);
      setLastResult(result);
      saveExperiment({ id: result.runId, createdAt: new Date().toISOString(), scenarioName: selectedProblem.name, domain: selectedProblem.domain, solver: result.solver, result });
      navigate('results');
    } catch (runError) {
      Alert.alert('Optimization could not be completed', runError instanceof Error ? runError.message : 'Please review the scenario and try again.');
    }
  };

  const solverLabel = solver === 'rko' ? 'RKO' : solver === 'simulatedAnnealing' ? 'Annealing' : solver === 'greedy' ? 'Greedy' : 'Quantum mock';

  return <AppPage>
    <TopBar title="Optimization Workbench" subtitle="Compare the baseline with alternative optimization approaches." actionLabel="Change case" onAction={()=>navigate('useCases')}/>
    <Surface><View style={styles.stepper}><Step active n="1" label="Business problem"/><Step active={false} n="2" label="Optimization"/><Step active={false} n="3" label="Evidence"/></View></Surface>
    <Surface tone="hero" style={[styles.hero, !isTablet && styles.stack]}>
      <View style={{flex:1}}><Pill label={selectedProblem.domain.toUpperCase()} tone={selectedProblem.domain==='portfolio'?'violet':selectedProblem.domain==='robotics'?'amber':'blue'}/><Title size="section">{selectedProblem.name}</Title><Body>{selectedProblem.description}</Body><View style={styles.dataGrid}><DataRow label="Decision variables" value={String(selectedProblem.variables)} tone="blue"/><DataRow label="Constraints" value={String(selectedProblem.constraints.length)} tone="amber"/><DataRow label="Scale" value={`${selectedProblem.scale}/10`} tone="cyan"/><DataRow label="Baseline" value="Current operating plan" tone="neutral"/></View></View>
      <View style={[styles.objective, !isTablet && styles.objectiveMobile]}><Eyebrow tone="neutral">OBJECTIVE</Eyebrow><Text style={styles.objectiveText}>{selectedProblem.objective}</Text><Pill label={selectedProblem.direction.toUpperCase()} tone="cyan"/></View>
    </Surface>
    <Section title="Solver strategy" subtitle="Classical methods remain the benchmark."/>
    <Segmented items={['RKO','Annealing','Greedy','Quantum mock']} selected={solverLabel} onChange={value=>setSolver(value==='RKO'?'rko':value==='Annealing'?'simulatedAnnealing':value==='Greedy'?'greedy':'quantumMock')}/>
    <Surface><Section title="Experiment controls" subtitle="Deterministic seed and bounded search budget"/><DataRow label="Iterations" value={String(iterations)} tone="blue" note="10–120"/><View style={styles.stepperRow}><Button title="−10" kind="secondary" onPress={()=>setIterations(value=>Math.max(10,value-10))}/><Button title="+10" kind="secondary" onPress={()=>setIterations(value=>Math.min(120,value+10))}/></View><Progress label="Search budget" value={iterations/120} right={`${iterations}/120`} tone="blue"/><DataRow label="Seed" value={String(seed)} tone="violet" note="Reproducibility key"/><View style={styles.stepperRow}><Button title="−1" kind="secondary" onPress={()=>setSeed(value=>Math.max(1,value-1))}/><Button title="+1" kind="secondary" onPress={()=>setSeed(value=>value+1)}/></View></Surface>
    <Surface><Section title="Active constraints" subtitle="Hard constraints protect feasibility; soft constraints shape trade-offs."/>{selectedProblem.constraints.map(constraint=><DataRow key={constraint.id} label={constraint.label} value={constraint.type.toUpperCase()} tone={constraint.type==='hard'?'red':'amber'} note={constraint.description}/>)}</Surface>
    {error && <ErrorState title="Optimization could not be completed" detail={error} action={<Button title="Try again" onPress={execute}/>}/>}
    <ConstraintInspector/><SolverTable/>
    <Button title={busy ? 'Running optimization…' : `Run ${solver==='quantumMock'?'quantum-style':'classical'} experiment`} onPress={execute} disabled={busy} full/>
  </AppPage>;
}

function Step({n,label,active}:{n:string;label:string;active:boolean}) { return <View style={styles.step}><View style={[styles.stepCircle,active&&styles.stepCircleActive]}><Text style={[styles.stepN,active&&{color:ui.colors.canvas}]}>{n}</Text></View><Text style={[styles.stepLabel,active&&{color:ui.colors.text}]}>{label}</Text></View>; }

const styles=StyleSheet.create({stepper:{flexDirection:'row',gap:14,alignItems:'center'},step:{flexDirection:'row',alignItems:'center',gap:5,flex:1},stepCircle:{width:24,height:24,borderRadius:12,borderWidth:1,borderColor:ui.colors.line,alignItems:'center',justifyContent:'center'},stepCircleActive:{backgroundColor:ui.colors.text},stepN:{color:ui.colors.text3,fontSize:9,fontWeight:'900'},stepLabel:{color:ui.colors.text3,fontSize:8,fontWeight:'800'},hero:{flexDirection:'row',gap:14},stack:{flexDirection:'column'},dataGrid:{marginTop:8},objective:{width:220,backgroundColor:'#0A1928',borderRadius:14,padding:14,borderWidth:1,borderColor:ui.colors.lineSoft,gap:7},objectiveMobile:{width:'100%'},objectiveText:{color:ui.colors.text,fontSize:16,lineHeight:22,fontWeight:'900'},stepperRow:{flexDirection:'row',gap:8,justifyContent:'flex-end',marginTop:5}});
