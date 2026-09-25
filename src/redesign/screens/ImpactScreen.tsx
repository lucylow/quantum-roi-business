import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../../domain';
import { useApp } from '../../context/AppContext';
import { AppPage, Body, Button, DataRow, Eyebrow, Section, Surface, TinyBarChart, Title } from '../components/ui';
import { BusinessImpactCard, ConvergenceCard, TopBar } from '../components/enterprise';
import { ui } from '../theme';
import { useResponsiveLayout } from '../useResponsiveLayout';

export function ImpactScreen({navigate}:{navigate:(s:ScreenName)=>void}) {
  const { lastResult, selectedProblem } = useApp();
  const { isTablet } = useResponsiveLayout();
  return <AppPage>
    <TopBar title="Business Impact" subtitle="Translate objective-function changes into operating and financial context." actionLabel="Decision memo" onAction={()=>navigate('insights')}/>
    <BusinessImpactCard/>
    <View style={[styles.grid, !isTablet && styles.stack]}><Surface style={styles.gridItem}><Section title="Value drivers" subtitle="Illustrative contribution to modeled net value"/><TinyBarChart values={[41,28,19,12]} labels={['Efficiency','Capacity','Service','Labor']} tone="cyan"/>{[['Route efficiency','41%','cyan'],['Capacity utilization','28%','blue'],['Next-day coverage','19%','green'],['Labor efficiency','12%','violet']].map(row=><DataRow key={row[0]} label={row[0]} value={row[1]} tone={row[2] as any}/>)}</Surface><Surface style={styles.gridItem}><Section title="Cost drivers" subtitle="Synthetic implementation model"/><TinyBarChart values={[32,21,18,17,12]} labels={['Eng','Data','Cloud','Integr.','Ops']} tone="amber"/>{[['Engineering','32%'],['Data preparation','21%'],['Cloud infrastructure','18%'],['Integration','17%'],['Operations','12%']].map(row=><DataRow key={row[0]} label={row[0]} value={row[1]} tone="amber"/>)}</Surface></View>
    <Surface><Section title="Risk factors" subtitle="Factors that could prevent a modeled benefit from being realized."/>{[['Data quality','Medium','amber'],['Integration complexity','Medium','amber'],['Adoption','Medium','amber'],['Model uncertainty','High','red'],['Quantum availability','Informational','blue']].map(row=><DataRow key={row[0]} label={row[0]} value={row[1]} tone={row[2] as any}/>)}</Surface>
    <ConvergenceCard/>
    <Surface tone="hero"><Eyebrow tone="cyan">DECISION SUMMARY</Eyebrow><Title size="section">{selectedProblem.name}</Title><Body>Use the classical benchmark as the reference. Validate the assumptions with operational data before treating the modeled impact as a financial forecast.</Body><View style={styles.actions}><Button title="Open scenarios" onPress={()=>navigate('insights')}/><Button title="Inspect quantum path" kind="secondary" onPress={()=>navigate('compare')}/></View>{lastResult&&<Text style={styles.meta}>Run {lastResult.runId} · {lastResult.durationMs} ms · status {lastResult.status}</Text>}</Surface>
  </AppPage>;
}

const styles=StyleSheet.create({grid:{flexDirection:'row',gap:10},stack:{flexDirection:'column'},gridItem:{flex:1},actions:{flexDirection:'row',gap:8,flexWrap:'wrap'},meta:{color:ui.colors.text3,fontSize:9,marginTop:3}});
