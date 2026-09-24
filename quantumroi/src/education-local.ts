import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY = "quantumroi.education.progress.v1";
export async function loadCompletedLessons(): Promise<string[]> { const raw = await AsyncStorage.getItem(KEY); if (!raw) return []; try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []; } catch { return []; } }
export async function saveCompletedLessons(ids: string[]): Promise<void> { await AsyncStorage.setItem(KEY, JSON.stringify([...new Set(ids)])); }
const QUIZ_KEY = "quantumroi.education.quiz.v1";
export async function loadPassedQuizzes(): Promise<string[]> { const raw = await AsyncStorage.getItem(QUIZ_KEY); if (!raw) return []; try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []; } catch { return []; } }
export async function savePassedQuizzes(ids: string[]): Promise<void> { await AsyncStorage.setItem(QUIZ_KEY, JSON.stringify([...new Set(ids)])); }
