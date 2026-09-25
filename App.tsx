import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import type { ScreenName } from './src/domain';
import { AppProvider, useApp } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { UseCasesScreen } from './src/screens/UseCasesScreen';
import { ScenarioScreen } from './src/screens/ScenarioScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { CompareScreen } from './src/screens/CompareScreen';
import { ExperimentScreen } from './src/screens/ExperimentScreen';
import { QuboScreen } from './src/screens/QuboScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BottomNav } from './src/components/BottomNav';
import { colors } from './src/theme';

function Shell() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const { lastResult } = useApp();
  const navigate = (next: ScreenName) => {
    if (next === 'results' && !lastResult) setScreen('scenario');
    else setScreen(next);
  };

  const screenView = (() => {
    switch (screen) {
      case 'home': return <HomeScreen navigate={navigate} />;
      case 'useCases': return <UseCasesScreen navigate={navigate} />;
      case 'scenario': return <ScenarioScreen navigate={navigate} />;
      case 'results': return <ResultsScreen navigate={navigate} />;
      case 'insights': return <InsightsScreen navigate={navigate} />;
      case 'compare': return <CompareScreen navigate={navigate} />;
      case 'experiment': return <ExperimentScreen navigate={navigate} />;
      case 'qubo': return <QuboScreen navigate={navigate} />;
      case 'settings': return <SettingsScreen />;
    }
  })();

  return <View style={{ flex: 1, backgroundColor: colors.bg }}><StatusBar style="light" />{screenView}<BottomNav current={screen} onNavigate={navigate} /></View>;
}

export default function App() {
  return <AppProvider><Shell /></AppProvider>;
}
