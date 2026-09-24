import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OptimizationResult } from "./quantumroi-mvp";

const KEY = "quantumroi.saved-experiments.v1";

export async function listSavedExperiments(): Promise<OptimizationResult[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OptimizationResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveExperiment(experiment: OptimizationResult): Promise<void> {
  const current = await listSavedExperiments();
  const next = [experiment, ...current.filter((item) => item.id !== experiment.id)].slice(0, 25);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
