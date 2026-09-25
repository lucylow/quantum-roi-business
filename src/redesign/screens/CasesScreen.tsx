import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ScreenName } from '../../domain';
import { useApp } from '../../context/AppContext';
import { enterpriseCases } from '../data/mockEnterprise';
import { AppPage, Body, Button, EmptyState, Segmented, Section } from '../components/ui';
import { SearchField } from '../components/advanced';
import { CaseCard, TopBar } from '../components/enterprise';

export function CasesScreen({ navigate }:{navigate:(s:ScreenName)=>void}) {
  const { setSelectedProblem } = useApp();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const filters = ['All', 'Logistics', 'Workforce', 'Finance', 'Manufacturing', 'Energy', 'Marketing', 'Healthcare'];
  const list = useMemo(() => enterpriseCases.filter((caseItem) => {
    const matchesFilter = filter === 'All' || caseItem.industry === filter;
    const haystack = `${caseItem.name} ${caseItem.description} ${caseItem.tags.join(' ')}`.toLowerCase();
    return matchesFilter && haystack.includes(query.trim().toLowerCase());
  }), [filter, query]);

  return <AppPage>
    <TopBar title="Optimization Use Cases" subtitle="Start with the operational problem — not the technology."/>
    <Section title="Find a business problem" subtitle="18 synthetic enterprise cases across routing, staffing, finance, manufacturing, energy, and more."/>
    <SearchField placeholder="Search use cases, industries, or tags" onChange={setQuery}/>
    <Segmented items={filters} selected={filter} onChange={setFilter}/>
    <View style={styles.helper}><Body>{list.length} matching {list.length === 1 ? 'case' : 'cases'}</Body>{(filter !== 'All' || query) && <Button title="Clear" kind="ghost" onPress={()=>{setFilter('All');setQuery('');}}/>}</View>
    {list.length ? <View style={{gap:10}}>{list.map((item, index)=><CaseCard key={item.id} item={item} onPress={()=>{setSelectedProblem(require('../../data/mock').useCases[Math.min(index,3)]);navigate('scenario');}}/>)}</View> : <EmptyState title="No matching cases" detail="Try a shorter search term or return to the full catalog." action={<Button title="Show all cases" onPress={()=>{setFilter('All');setQuery('');}}/>}/>}
  </AppPage>;
}

const styles=StyleSheet.create({helper:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:2}});
