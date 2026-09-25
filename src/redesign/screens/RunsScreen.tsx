import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ScreenName } from '../../domain';
import { enterpriseRuns } from '../data/mockEnterprise';
import { quarterlyReports } from '../data/mockAnalytics';
import { ReportPreview } from '../components/advanced';
import { AppPage, Button, EmptyState, Section, Segmented, Surface } from '../components/ui';
import { RunRow, TopBar } from '../components/enterprise';
import { useResponsiveLayout } from '../useResponsiveLayout';

export function RunsScreen({navigate}:{navigate:(s:ScreenName)=>void}) {
  const [filter, setFilter] = useState('All');
  const { isTablet } = useResponsiveLayout();
  const list = useMemo(() => enterpriseRuns.filter(run => filter === 'All' || run.status === filter), [filter]);
  const filters = ['All','Completed','Running','Needs review','Prepared','Failed'];
  return <AppPage>
    <TopBar title="Experiments & Runs" subtitle="A reproducible history of optimization benchmarks, formulations, and review states." actionLabel="New run" onAction={()=>navigate('scenario')}/>
    <Segmented items={filters} selected={filter} onChange={setFilter}/>
    {list.length ? <Surface><Section title="Run history" subtitle={`${list.length} synthetic experiment records`}/>{list.map(run=><RunRow key={run.id} run={run} onPress={()=>navigate(run.solver.includes('QUBO')?'compare':'results')}/>)}</Surface> : <EmptyState title="No runs in this state" detail="Change the filter or create a new scenario run." action={<Button title="New run" onPress={()=>navigate('scenario')}/>}/>}
    <Section title="Reports" subtitle="Exportable decision records built from the experiment portfolio"/>
    <View style={{gap:10}}>{quarterlyReports.slice(0,2).map(report=><ReportPreview key={report.id} title={report.title} period={report.period} value={report.value} cases={report.cases} experiments={report.experiments} onOpen={()=>navigate('insights')}/>)}</View>
    <View style={[styles.grid, !isTablet && styles.stack]}><Surface style={styles.gridItem}><Section title="Run policy"/><Button title="Classical first" kind="secondary" onPress={()=>navigate('scenario')}/></Surface><Surface style={styles.gridItem}><Section title="Evidence"/><Button title="Open evidence chain" kind="secondary" onPress={()=>navigate('insights')}/></Surface></View>
  </AppPage>;
}

const styles=StyleSheet.create({grid:{flexDirection:'row',gap:10},stack:{flexDirection:'column'},gridItem:{flex:1}});
