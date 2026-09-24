import AsyncStorage from "@react-native-async-storage/async-storage";

export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type LocalTask = { id: string; title: string; status: "todo" | "in_progress" | "done"; priority: TaskPriority; dueAt?: string; pendingSync: boolean; createdAt: string };
const KEY = "quantumroi.business.tasks.v1";
const seed: LocalTask[] = [
  { id: "task-1", title: "Confirm delivery window", status: "todo", priority: "high", dueAt: "2026-08-22", pendingSync: false, createdAt: "2026-08-22T09:00:00.000Z" },
  { id: "task-2", title: "Review route exception", status: "in_progress", priority: "urgent", dueAt: "2026-08-22", pendingSync: false, createdAt: "2026-08-22T08:30:00.000Z" },
  { id: "task-3", title: "Send customer update", status: "todo", priority: "normal", pendingSync: false, createdAt: "2026-08-22T08:00:00.000Z" },
];

export async function listLocalTasks(): Promise<LocalTask[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return seed;
  try { return JSON.parse(raw) as LocalTask[]; } catch { return seed; }
}

export async function createLocalTask(title: string, priority: TaskPriority = "normal", dueAt?: string): Promise<LocalTask> {
  const tasks = await listLocalTasks();
  const task: LocalTask = { id: `offline-task-${Date.now()}`, title: title.trim(), status: "todo", priority, dueAt, pendingSync: true, createdAt: new Date().toISOString() };
  await AsyncStorage.setItem(KEY, JSON.stringify([task, ...tasks]));
  return task;
}

export async function toggleLocalTask(id: string): Promise<LocalTask[]> {
  const tasks = await listLocalTasks();
  const next: LocalTask[] = tasks.map((task) => task.id === id ? { ...task, status: (task.status === "done" ? "todo" : "done") as LocalTask["status"], pendingSync: true } : task);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function completeLocalTasks(ids: string[]): Promise<LocalTask[]> {
  const selected = new Set(ids);
  const next: LocalTask[] = (await listLocalTasks()).map((task) => selected.has(task.id) ? { ...task, status: "done" as const, pendingSync: true } : task);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function updateLocalTask(id: string, patch: Partial<Pick<LocalTask, "title" | "priority" | "dueAt">>): Promise<LocalTask[]> {
  const next = (await listLocalTasks()).map((task) => task.id === id ? { ...task, ...patch, pendingSync: true } : task);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function deleteLocalTask(id: string): Promise<LocalTask[]> {
  const next = (await listLocalTasks()).filter((task) => task.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
