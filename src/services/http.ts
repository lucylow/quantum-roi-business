import { assertSafeApiUrl } from '../config';
import { sanitizeError } from '../platform/errorReporting';

export class ApiError extends Error {
  readonly status: number;
  readonly requestId?: string;
  readonly retryable: boolean;

  constructor(message: string, options: { status?: number; requestId?: string; retryable?: boolean } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? 0;
    this.requestId = options.requestId;
    this.retryable = options.retryable ?? false;
  }
}

const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_RETRIES = 1;
const MAX_RESPONSE_BYTES = 2_000_000;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function retryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function parseResponseBody(text: string): unknown {
  if (!text) return null;
  if (text.length > MAX_RESPONSE_BYTES) throw new ApiError('Server response is too large.', { status: 413 });
  try { return JSON.parse(text); } catch { return text; }
}

export async function requestJson<T>(baseUrl: string, path: string, init: RequestInit = {}, options: { timeoutMs?: number; retries?: number } = {}): Promise<T> {
  if (!assertSafeApiUrl(baseUrl)) throw new ApiError('API endpoint is not configured for this build.');
  if (!path.startsWith('/')) throw new ApiError('Invalid API path.');

  const timeoutMs = Math.max(1_000, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const retries = Math.max(0, Math.min(2, options.retries ?? DEFAULT_RETRIES));
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      });
      const requestId = response.headers.get('x-request-id') ?? response.headers.get('x-amzn-trace-id') ?? undefined;
      const text = await response.text();
      const parsed = parseResponseBody(text);

      if (!response.ok) {
        const message = typeof parsed === 'string' ? parsed.slice(0, 300) : 'The optimization service returned an error.';
        throw new ApiError(message, { status: response.status, requestId, retryable: retryableStatus(response.status) });
      }

      return parsed as T;
    } catch (error) {
      lastError = error;
      const isRetryable = error instanceof ApiError ? error.retryable : true;
      if (attempt >= retries || !isRetryable) break;
      await sleep(250 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError instanceof ApiError) throw lastError;
  throw new ApiError(`Network request failed: ${sanitizeError(lastError)}`, { retryable: true });
}
