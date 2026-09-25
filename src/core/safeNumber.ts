export const MAX_SAFE_BUSINESS_NUMBER = 1e15;

export function finiteNumber(value: unknown, fallback = 0): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  if (Math.abs(number) > MAX_SAFE_BUSINESS_NUMBER) return fallback;
  return number;
}

export function positiveNumber(value: unknown, fallback = 1): number {
  const number = finiteNumber(value, fallback);
  return number > 0 ? number : fallback;
}

export function clampNumber(value: unknown, min: number, max: number, fallback = min): number {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) return fallback;
  return Math.min(max, Math.max(min, finiteNumber(value, fallback)));
}

export function safePercent(numerator: unknown, denominator: unknown): number {
  const a = finiteNumber(numerator);
  const b = finiteNumber(denominator);
  if (b === 0) return 0;
  return ((a - b) / Math.abs(b)) * 100;
}

export function safeRatio(numerator: unknown, denominator: unknown, fallback = 0): number {
  const a = finiteNumber(numerator);
  const b = finiteNumber(denominator);
  return b === 0 ? fallback : a / b;
}
