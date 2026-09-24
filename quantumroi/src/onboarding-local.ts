import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingDraft = { step: number; role: "owner" | "operator" | "manager" | "developer" | "learner" | ""; businessName: string; workflow: "routing" | "scheduling" | "inventory" | "quantum-lab" | "" };
const KEY = "quantumroi.onboarding.v1";
export const emptyOnboarding: OnboardingDraft = { step: 0, role: "", businessName: "", workflow: "" };
export async function loadOnboarding(): Promise<OnboardingDraft> { const raw = await AsyncStorage.getItem(KEY); if (!raw) return emptyOnboarding; try { return { ...emptyOnboarding, ...(JSON.parse(raw) as Partial<OnboardingDraft>) }; } catch { return emptyOnboarding; } }
export async function saveOnboarding(draft: OnboardingDraft): Promise<void> { await AsyncStorage.setItem(KEY, JSON.stringify(draft)); }
export async function completeOnboarding(): Promise<void> { await AsyncStorage.setItem(KEY, JSON.stringify({ ...emptyOnboarding, step: 3 })); }
