import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ScreenName } from '../../domain';
import { scenarioSets, sensitivity } from '../data/mockEnterprise';
import { AssumptionTable, Waterfall } from '../components/advanced';
import { AppPage, Body, DataRow, Progress, Section, Surface, TinyBarChart } from '../components/ui';
import { ScenarioCard, TopBar } from '../components/enterprise';
import { ui } from '../theme';
import { useResponsiveLayout } from '../useResponsiveLayout';

export function ScenarioLabScreen({navigate:_navigate}:{navigate:(s:ScreenName)=>void}) {
  const [selected, setSelected] = useState('base');
  const { isTablet } = useResponsiveLayout();
  return <AppPage>
    <TopBar title="Scenario Laboratory" subtitle="Understand which assumptions actually change the business case."/>
    <Section title="Three decision scenarios" subtitle="Synthetic assumptions for product demonstration"/>
    <View style={styles.scenarios}>{scenarioSets.map(scenario=><ScenarioCard key={scenario.id} title={scenario.name} badge={scenario.badge} optimization={scenario.optimization} adoption={scenario.adoption} implementation={scenario.implementation} risk={scenario.risk} value={scenario.value} selected={selected===scenario.id} onPress={()=>setSelected(scenario.id)}/>)}</View>
    <Surface><Section title="Annual value range" subtitle="Modeled net value by scenario"/><TinyBarChart values={scenarioSets.map(scenario=>scenario.value)} labels={scenarioSets.map(scenario=>scenario.name)} tone="cyan"/></Surface>
    <Surface><Section title="Sensitivity analysis" subtitle="Impact on modeled net value when each driver moves through its range."/>{sensitivity.map((item,index)=><View key={item.label} style={{gap:6,paddingVertical:9,borderBottomWidth:index<sensitivity.length-1?1:0,borderBottomColor:ui.colors.lineSoft}}><DataRow label={item.label} value={`${item.impact}%`} tone={index===0?'cyan':index===1?'blue':index===2?'violet':'amber'} note={`${item.baseline} · ${item.range}`}/><Progress value={item.impact/45} tone={index===0?'cyan':index===1?'blue':'violet'}/></View>)}</Surface>
    <View style={[styles.grid, !isTablet && styles.stack]}><View style={styles.gridItem}><AssumptionTable rows={sensitivity.map(item=>({label:item.label,value:item.baseline,range:item.range,impact:item.impact}))}/></View><View style={styles.gridItem}><Waterfall items={[{label:'Baseline',value:126.8,tone:'neutral' as const},{label:'Efficiency',value:-17.1,tone:'cyan' as const},{label:'Implementation',value:-3.8,tone:'amber' as const},{label:'Net value',value:14.6,tone:'green' as const}]}/></View></View>
    <Surface tone="hero"><Section title="Scenario interpretation"/><Body>{selected==='conservative'?'The conservative case reduces the modeled upside while applying higher risk adjustment and slower implementation.':selected==='expansion'?'The expansion case assumes stronger adoption and faster implementation; validate both assumptions before using the scenario for planning.':'The base case balances adoption, implementation cost, and model improvement assumptions for demonstration.'}</Body></Surface>
  </AppPage>;
}

const styles=StyleSheet.create({scenarios:{flexDirection:'row',gap:10,flexWrap:'wrap'},grid:{flexDirection:'row',gap:10},stack:{flexDirection:'column'},gridItem:{flex:1}});
