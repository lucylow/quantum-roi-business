import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, useWindowDimensions } from 'react-native';
import type { ScreenName } from './src/domain';
import { AppProvider, useApp } from './src/context/AppContext';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { EnterpriseHeader, MobileNav } from './src/redesign/components/enterprise';
import { OverviewScreen } from './src/redesign/screens/OverviewScreen';
import { CasesScreen } from './src/redesign/screens/CasesScreen';
import { WorkbenchScreen } from './src/redesign/screens/WorkbenchScreen';
import { ImpactScreen } from './src/redesign/screens/ImpactScreen';
import { ScenarioLabScreen } from './src/redesign/screens/ScenarioLabScreen';
import { QuantumLabScreen } from './src/redesign/screens/QuantumLabScreen';
import { RunsScreen } from './src/redesign/screens/RunsScreen';
import { SettingsRedesignScreen } from './src/redesign/screens/SettingsRedesignScreen';
import { ui } from './src/redesign/theme';

function Shell() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const { lastResult } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 760;

  const navigate = (next: ScreenName) => {
    if (next === 'results' && !lastResult) setScreen('scenario');
    else setScreen(next);
  };

  const content = useMemo(() => {
    switch (screen) {
      case 'home': return <OverviewScreen navigate={navigate} />;
      case 'useCases': return <CasesScreen navigate={navigate} />;
      case 'scenario': return <WorkbenchScreen navigate={navigate} />;
      case 'results': return <ImpactScreen navigate={navigate} />;
      case 'insights': return <ScenarioLabScreen navigate={navigate} />;
      case 'compare':
      case 'qubo': return <QuantumLabScreen navigate={navigate} />;
      case 'experiment': return <RunsScreen navigate={navigate} />;
      case 'settings': return <SettingsRedesignScreen navigate={navigate} />;
    }
  }, [screen, lastResult]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ui.colors.canvas }}>
      <StatusBar style="light" />
      {isDesktop ? <EnterpriseHeader current={screen} onNavigate={navigate} /> : null}
      {content}
      {!isDesktop ? <MobileNav current={screen} onNavigate={navigate} /> : null}
    </SafeAreaView>
  );
}

export default function App() {
  return <AppErrorBoundary><AppProvider><Shell /></AppProvider></AppErrorBoundary>;
}
