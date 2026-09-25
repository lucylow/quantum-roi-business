import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ScreenName } from '../../domain';
import { useApp } from '../../context/AppContext';
import { enterpriseCases, activity, metrics } from '../data/mockEnterprise';
import { AppPage, Body, Button, Eyebrow, MetricCard, Pill, Progress, Section, Sparkline, Surface, TinyBarChart, Title } from '../components/ui';
import { BusinessImpactCard, CaseCard, ConvergenceCard, TopBar } from '../components/enterprise';
import { KPIHealthGrid, TrendPanel, DriverBars } from '../components/advanced';
import { kpiHealth, annualValueTrend, runVolumeTrend, valueDrivers } from '../data/mockAnalytics';
import { ui } from '../theme';
import { useResponsiveLayout } from '../useResponsiveLayout';

export function OverviewScreen({ navigate }: { navigate:(s:ScreenName)=>void }) {
  const { setSelectedProblem } = useApp();
  const { isTablet } = useResponsiveLayout();
  const featured = enterpriseCases.slice(0,3);
  return <AppPage>
    <TopBar title="Optimization Intelligence" subtitle="Monitor active business cases, modeled value, experiments, and quantum-readiness opportunities." actionLabel="New case" onAction={()=>navigate('useCases')} />
    <View style={styles.kpis}>
      <MetricCard label="Active opportunities" value={String(metrics.activeOpportunities)} delta="4 require review" tone="cyan" />
      <MetricCard label="Modeled annual value" value={`$${metrics.modeledAnnualValue.toFixed(1)}M`} delta="Across 12 scenarios" tone="green" />
      <MetricCard label="Optimization runs" value={String(metrics.optimizationRuns)} delta="Last 30 days" tone="blue" />
      <MetricCard label="Quantum-ready" value={String(metrics.quantumReady)} delta="Across 4 families" tone="violet" />
      <MetricCard label="Experiments" value={String(metrics.experiments)} delta="6 currently active" tone="amber" />
    </View>
    <Surface tone="hero" style={[styles.hero, !isTablet && styles.stack]}>
      <View style={{flex:1,gap:8}}><Pill label="ILLUSTRATIVE ENTERPRISE DEMO DATA" tone="blue"/><Title size="display">Where optimization could matter most</Title><Body>Start with the operational problem. Establish a baseline. Then compare classical optimization, scenarios, and a quantum-ready formulation without inventing a quantum advantage.</Body><View style={styles.heroActions}><Button title="Open middle-mile analysis" onPress={()=>{setSelectedProblem(require('../../data/mock').useCases[0]);navigate('scenario')}}/><Button title="Explore 18 cases" kind="secondary" onPress={()=>navigate('useCases')}/></View></View>
      <View style={[styles.heroAside, !isTablet && styles.heroAsideMobile]}><Eyebrow tone="cyan">MIDDLE-MILE DELIVERY</Eyebrow><Text style={styles.heroValue}>$18.4M</Text><Text style={styles.heroLabel}>modeled annual value</Text><View style={{height:14}}/><DataLine label="Baseline cost" value="$126.8M"/><DataLine label="Optimized cost" value="$109.7M" tone="green"/><DataLine label="Next-day coverage" value="71.4% → 82.3%" tone="cyan"/><DataLine label="Confidence" value="Medium" tone="amber"/></View>
    </Surface>
    <View style={styles.quickLinks}><Button title="Scenario lab" kind="secondary" onPress={()=>navigate('insights')}/><Button title="Quantum readiness" kind="secondary" onPress={()=>navigate('compare')}/><Button title="Run history" kind="secondary" onPress={()=>navigate('experiment')}/></View>
    <KPIHealthGrid items={kpiHealth} />
    <View style={[styles.grid, !isTablet && styles.stack]}><TrendPanel title="Modeled value trend" subtitle="Illustrative quarterly portfolio value" series={annualValueTrend} tone="cyan" unit="M"/><TrendPanel title="Run volume" subtitle="Completed and active experiments" series={runVolumeTrend} tone="blue"/></View>
    <DriverBars title="Value drivers" subtitle="Synthetic contribution model" lines={valueDrivers}/>
    <Section title="Opportunity pipeline" subtitle="From business problem to validated evidence" />
    <Surface><View style={styles.pipeline}>{['Opportunity','Baseline','Classical optimization','Quantum formulation','Experiment','Validated'].map((item,i)=><View key={item} style={styles.pipe}><View style={[styles.pipeCircle,{backgroundColor:i<3?ui.colors.green:i===3?ui.colors.violet:ui.colors.surfaceRaised,borderColor:i<4?ui.colors.line:ui.colors.line}]}><Text style={[styles.pipeIndex,{color:i<3?ui.colors.canvas:ui.colors.text3}]}>{i+1}</Text></View><Text style={styles.pipeLabel}>{item}</Text>{i<5&&<View style={[styles.pipeLine,{backgroundColor:i<2?ui.colors.green:ui.colors.line}]}/>}</View>)}</View></Surface>
    <Section title="Priority opportunities" subtitle="Synthetic data · examples based on optimization problem families" action={<Button title="View all" kind="ghost" onPress={()=>navigate('useCases')} />} />
    <View style={styles.cards}>{featured.map((item,i)=><CaseCard key={item.id} item={item} onPress={()=>{setSelectedProblem(require('../../data/mock').useCases[Math.min(i,3)]);navigate('scenario')}}/>)}</View>
    <View style={[styles.grid, !isTablet && styles.stack]}><BusinessImpactCard/><ConvergenceCard/></View>
    <View style={[styles.grid, !isTablet && styles.stack]}><ActivityCard/><PortfolioSignal/></View>
  </AppPage>;
}

function DataLine({label,value,tone='neutral'}:{label:string;value:string;tone?:'neutral'|'green'|'cyan'|'amber'}) { return <View style={styles.dataLine}><Text style={styles.dataLabel}>{label}</Text><Text style={[styles.dataValue,{color:tone==='green'?ui.colors.green:tone==='cyan'?ui.colors.cyan:tone==='amber'?ui.colors.amber:ui.colors.text2}]}>{value}</Text></View>; }
function ActivityCard(){ return <Surface><Section title="Recent activity" subtitle="Latest model and experiment events"/>{activity.slice(0,5).map(a=><View key={a.time+a.title} style={styles.activity}><View style={[styles.activityDot,{backgroundColor:(ui.colors as any)[a.tone]??ui.colors.blue}]}/><View style={{flex:1}}><Text style={styles.activityTitle}>{a.title}</Text><Text style={styles.activityDetail}>{a.detail}</Text></View><Text style={styles.activityTime}>{a.time}</Text></View>)}</Surface>; }
function PortfolioSignal(){return <Surface><Section title="Portfolio signal" subtitle="Synthetic allocation benchmark"/><TinyBarChart values={[18,22,17,15,12,10,6]} labels={['AIIF','LSI','IAC','HCS','SCF','RPP','Cash']} tone="violet"/><Sparkline values={[8.4,9.2,8.8,10.1,10.6,11.8,12.8]} tone="violet"/><Progress label="Target return" value={.82} right="12.8% / 15.6%" tone="violet"/><Progress label="Risk budget" value={.61} right="4.9% / 8.0%" tone="green"/></Surface>}

const styles=StyleSheet.create({kpis:{flexDirection:'row',flexWrap:'wrap',gap:10},hero:{flexDirection:'row',gap:20,padding:20},stack:{flexDirection:'column'},heroActions:{flexDirection:'row',gap:8,flexWrap:'wrap',marginTop:8},heroAside:{width:245,minWidth:220,borderWidth:1,borderColor:ui.colors.lineSoft,borderRadius:15,padding:14,backgroundColor:'#081A29'},heroAsideMobile:{width:'100%',minWidth:0},quickLinks:{flexDirection:'row',gap:8,flexWrap:'wrap'},heroValue:{color:ui.colors.text,fontSize:36,fontWeight:'900',letterSpacing:-1,marginTop:3},heroLabel:{color:ui.colors.text3,fontSize:9,fontWeight:'700'},dataLine:{flexDirection:'row',justifyContent:'space-between',gap:10,paddingVertical:7,borderTopWidth:1,borderTopColor:ui.colors.lineSoft},dataLabel:{color:ui.colors.text3,fontSize:9,fontWeight:'800'},dataValue:{fontSize:10,fontWeight:'900',textAlign:'right'},pipeline:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',gap:2},pipe:{alignItems:'center',flexDirection:'row',flex:1},pipeCircle:{width:26,height:26,borderRadius:13,borderWidth:1,alignItems:'center',justifyContent:'center'},pipeIndex:{fontSize:9,fontWeight:'900'},pipeLabel:{color:ui.colors.text3,fontSize:8,fontWeight:'800',marginLeft:4,maxWidth:78},pipeLine:{height:2,flex:1,marginHorizontal:5},cards:{gap:10},grid:{flexDirection:'row',gap:10},activity:{flexDirection:'row',alignItems:'flex-start',gap:8,paddingVertical:9,borderBottomWidth:1,borderBottomColor:ui.colors.lineSoft},activityDot:{width:6,height:6,borderRadius:6,marginTop:5},activityTitle:{color:ui.colors.text2,fontSize:10,fontWeight:'800'},activityDetail:{color:ui.colors.text3,fontSize:9,marginTop:2},activityTime:{color:ui.colors.text3,fontSize:8,fontWeight:'800'} });
