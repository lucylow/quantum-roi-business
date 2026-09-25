export interface ErrorContext {
  scope: string;
  operation?: string;
  runId?: string;
  extra?: Record<string, string | number | boolean | null>;
}

const MAX_MESSAGE_LENGTH = 500;
const MAX_SCOPE_LENGTH = 80;

function safeString(value: unknown, fallback: string): string {
  const text = String(value ?? fallback).trim();
  return text.slice(0, MAX_MESSAGE_LENGTH);
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) return safeString(error.message, 'Unknown error');
  if (typeof error === 'string') return safeString(error, 'Unknown error');
  return 'An unexpected error occurred.';
}

export function recordError(error: unknown, context: ErrorContext): void {
  const payload = {
    scope: safeString(context.scope, 'unknown').slice(0, MAX_SCOPE_LENGTH),
    operation: context.operation ? safeString(context.operation, 'unknown').slice(0, MAX_SCOPE_LENGTH) : undefined,
    runId: context.runId ? safeString(context.runId, 'unknown').slice(0, 100) : undefined,
    message: sanitizeError(error),
    extra: context.extra,
  };

  // No remote telemetry by default. In production, this can be replaced with
  // a privacy-reviewed crash service without changing call sites.
  if (__DEV__) console.error('[Quantum ROI]', payload);
}
