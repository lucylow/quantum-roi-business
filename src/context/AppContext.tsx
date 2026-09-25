import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ExperimentRun, OptimizationProblem, OptimizationResult } from '../domain';
import { useCases } from '../data/mock';

interface AppContextValue {
  selectedProblem: OptimizationProblem;
  setSelectedProblem: (problem: OptimizationProblem) => void;
  lastResult: OptimizationResult | null;
  setLastResult: (result: OptimizationResult | null) => void;
  experiments: ExperimentRun[];
  saveExperiment: (run: ExperimentRun) => void;
}

const Context = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedProblem, setSelectedProblem] = useState(useCases[0]);
  const [lastResult, setLastResult] = useState<OptimizationResult | null>(null);
  const [experiments, setExperiments] = useState<ExperimentRun[]>([]);

  const value = useMemo<AppContextValue>(() => ({
    selectedProblem,
    setSelectedProblem,
    lastResult,
    setLastResult,
    experiments,
    saveExperiment: (run) => setExperiments((current) => [run, ...current].slice(0, 20))
  }), [selectedProblem, lastResult, experiments]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
