import { recordError } from './errorReporting';

export async function safeAsync<T>(operation: () => Promise<T>, context: { scope: string; operation?: string }): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    recordError(error, context);
    return null;
  }
}

export function isCancelledError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'AbortError' || /cancel/i.test(error.message));
}
