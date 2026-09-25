import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../../domain';
import { useApp } from '../../context/AppContext';
import { qpuMockDevices } from '../data/mockEnterprise';
import { evidenceChain } from '../data/mockAnalytics';
import { AppPage, Body, Button, DataRow, Eyebrow, Pill, Section, Surface, Title } from '../components/ui';
import { EvidenceChain } from '../components/advanced';
import { TopBar } from '../components/enterprise';
import { ui } from '../theme';
import { useResponsiveLayout } from '../useResponsiveLayout';

export function QuantumLabScreen({navigate}:{navigate:(s:ScreenName)=>void}) {
  const { selectedProblem, lastResult } = useApp();
  const { isTablet } = useResponsiveLayout();
  const [tab, setTab] = useState('Quantum readiness');
  const variables = Math.max(16, Math.min(96, selectedProblem.variables));
  const reduced = Math.max(12, Math.round(variables * .35));

  return <AppPage>
    <TopBar title="Quantum Readiness Lab" subtitle="Understand when a quantum experiment is technically meaningful—and when classical optimization should remain the reference."/>
    <Surface tone="hero"><View style={[styles.row, !isTablet && styles.stack]}><View style={{flex:1}}><Pill label="SIMULATED / DEMO" tone="green"/><Title size="section">Quantum formulation ready for review</Title><Body>Problem: {selectedProblem.name}. No live quantum hardware result is implied by this screen.</Body></View><View style={styles.score}><Text style={styles.scoreLabel}>READINESS</Text><Text style={styles.scoreValue}>{Math.min(91,50+selectedProblem.scale*4)}</Text><Text style={styles.scoreUnit}>/ 100</Text></View></View></Surface>
    <View style={styles.tabs}>{['Quantum readiness','QUBO matrix','Hardware','Evidence'].map(item=><Button key={item} title={item} kind={tab===item?'primary':'secondary'} onPress={()=>setTab(item)}/>)}</View>
    {tab==='Quantum readiness' && <><View style={[styles.grid, !isTablet && styles.stack]}><Surface style={styles.gridItem}><Section title="Model profile"/><DataRow label="Logical variables" value={String(variables)} tone="blue"/><DataRow label="Reduced kernel" value={String(reduced)} tone="violet"/><DataRow label="QUBO density" value="18.7%" tone="cyan"/><DataRow label="Embedding complexity" value="Moderate" tone="amber"/><DataRow label="Classical benchmark" value={lastResult?.solver.toUpperCase()||'RKO'} tone="green"/><DataRow label="Quantum execution" value="Not submitted" tone="neutral"/></Surface><Surface style={styles.gridItem}><Section title="Recommended path"/><DataRow label="1" value="Validate data and constraints" tone="green"/><DataRow label="2" value="Benchmark classical solvers" tone="green"/><DataRow label="3" value="Reduce model size" tone="violet"/><DataRow label="4" value="Simulate quantum formulation" tone="violet"/><DataRow label="5" value="Request QPU experiment" tone="amber"/></Surface></View><Surface><Section title="Why this candidate" subtitle="Reasons are explainable, not a quantum-advantage claim."/>{['The decision variables are binary or can be discretized.','The objective has a useful quadratic structure.','The problem can be reduced to a controlled kernel.','A classical reference can be measured before cloud execution.'].map(reason=><Text key={reason} style={styles.reason}>✓ {reason}</Text>)}</Surface></>}
    {tab==='QUBO matrix' && <QuboMatrix n={Math.min(12,reduced)}/>}
    {tab==='Hardware' && <Surface><Section title="Experiment targets" subtitle="Synthetic catalog for UI demonstration only."/>{qpuMockDevices.map(device=><View key={device.name} style={styles.device}><View style={{flex:1}}><Text style={styles.deviceName}>{device.name}</Text><Text style={styles.deviceMeta}>{device.provider} · {device.qubits} qubits</Text><Text style={styles.deviceReason}>{device.reason}</Text></View><Pill label={device.status.toUpperCase()} tone={device.status==='Available'?'green':'violet'}/></View>)}</Surface>}
    {tab==='Evidence' && <EvidenceChain items={evidenceChain}/>}
    <Surface><Eyebrow tone="violet">CLOUD EXECUTION GATE</Eyebrow><Title size="section">Live QPU submission is not automatic</Title><Body>Cloud quantum execution requires a configured service account, a compatible target, budget controls, and human review. The mobile demo never fabricates a completed QPU result.</Body><Button title="Prepare experiment brief" onPress={()=>navigate('experiment')}/></Surface>
  </AppPage>;
}

function QuboMatrix({n}:{n:number}) { return <Surface><Section title="QUBO interaction preview" subtitle="Dense regions indicate stronger modeled coupling."/><View style={styles.matrix}>{Array.from({length:n}).map((_,i)=><View key={i} style={styles.matrixRow}>{Array.from({length:n}).map((__,j)=>{const value=i===j?'●':((i*7+j*11)%5===0?'■':((i+j)%3===0?'·':' '));return <View key={j} style={[styles.cell,{backgroundColor:i===j?'#163E4B':value==='■'?'#2B3156':'#0B1C2B'}]}><Text style={[styles.cellText,{color:i===j?ui.colors.cyan:value==='■'?ui.colors.violet:ui.colors.text3}]}>{value}</Text></View>;})}</View>)}</View><View style={styles.equation}><Text style={styles.mono}>H(x) = xᵀQx</Text><Text style={styles.mono}>x ∈ {'{0,1}'} · linear + quadratic terms</Text><Text style={styles.mono}>Ising: H(z) = Σ Jᵢⱼzᵢzⱼ + Σ hᵢzᵢ + offset</Text></View></Surface>; }

const styles=StyleSheet.create({row:{flexDirection:'row',gap:16,alignItems:'center'},stack:{flexDirection:'column'},score:{width:90,height:90,borderRadius:45,borderWidth:1,borderColor:ui.colors.violet,backgroundColor:'#17162C',alignItems:'center',justifyContent:'center'},scoreLabel:{color:ui.colors.text3,fontSize:7,fontWeight:'900'},scoreValue:{color:ui.colors.text,fontSize:28,fontWeight:'900'},scoreUnit:{color:ui.colors.text3,fontSize:8,fontWeight:'800'},tabs:{flexDirection:'row',gap:6,flexWrap:'wrap'},grid:{flexDirection:'row',gap:10},gridItem:{flex:1},reason:{color:ui.colors.text2,fontSize:11,lineHeight:20},device:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12,borderBottomWidth:1,borderBottomColor:ui.colors.lineSoft},deviceName:{color:ui.colors.text,fontSize:11,fontWeight:'900'},deviceMeta:{color:ui.colors.text3,fontSize:9,marginTop:2},deviceReason:{color:ui.colors.text3,fontSize:9,marginTop:2},matrix:{gap:2},matrixRow:{flexDirection:'row',gap:2},cell:{width:21,height:21,alignItems:'center',justifyContent:'center',borderRadius:4},cellText:{fontSize:8,fontWeight:'900'},equation:{marginTop:10,backgroundColor:'#081A27',borderWidth:1,borderColor:ui.colors.lineSoft,borderRadius:12,padding:12,gap:5},mono:{...ui.type.mono,color:ui.colors.cyan}});
