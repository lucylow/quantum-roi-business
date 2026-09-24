export type AiIntent = "delivery-optimization" | "general-guidance" | "unsupported";
export type AiResponse = { intent: AiIntent; summary: string; missing: string[]; requiresApproval: boolean; mode: "DEMO"; warnings: string[] };

const SECRET_PATTERNS = [/sk-[A-Za-z0-9_-]+/g, /AKIA[A-Z0-9]{12,}/g, /Bearer\s+[A-Za-z0-9._-]+/gi];

export function redactSecrets(input: string): string {
  return SECRET_PATTERNS.reduce((value, pattern) => value.replace(pattern, "[REDACTED]"), input);
}

export function routeIntent(input: string): AiIntent {
  const text = input.toLowerCase();
  if (/(route|driver|delivery|stop|vehicle|dispatch)/.test(text)) return "delivery-optimization";
  if (/(optimize|schedule|allocate|plan|improve|business)/.test(text)) return "general-guidance";
  return "unsupported";
}

export function orchestrateDemo(input: string): AiResponse {
  const safe = redactSecrets(input.trim());
  const intent = routeIntent(safe);
  if (!safe) return { intent: "general-guidance", summary: "Describe an operational goal to get started.", missing: ["business goal"], requiresApproval: false, mode: "DEMO", warnings: [] };
  if (intent === "delivery-optimization") return { intent, summary: "This sounds like a delivery-route optimization problem. I can help compare routes once you confirm the number of vehicles, stops, depot, and route-time limit.", missing: ["vehicle count", "stop count", "depot", "maximum route time"], requiresApproval: false, mode: "DEMO", warnings: ["Suggestions are demo guidance until reviewed by a human."] };
  if (intent === "general-guidance") return { intent, summary: "I can help frame this as an optimization workflow, but the next step requires choosing a supported business use case.", missing: ["use case"], requiresApproval: false, mode: "DEMO", warnings: ["No action has been executed."] };
  return { intent, summary: "I can currently guide delivery-route optimization. No workflow was executed.", missing: ["supported use case"], requiresApproval: false, mode: "DEMO", warnings: ["Unsupported intent; try describing routes, drivers, or delivery stops."] };
}
