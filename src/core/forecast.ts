export interface TimePoint { timestamp: string; value: number; }
export interface ForecastPoint { timestamp: string; value: number; lower: number; upper: number; }

export function movingAverage(series: number[], window = 5): number[] {
  return series.map((_, index) => {
    const start = Math.max(0, index - window + 1);
    const subset = series.slice(start, index + 1);
    return subset.reduce((sum, value) => sum + value, 0) / Math.max(1, subset.length);
  });
}

export function exponentialSmoothing(series: number[], alpha = 0.35): number[] {
  if (!series.length) return [];
  const result = [series[0]];
  for (let i = 1; i < series.length; i += 1) result.push(alpha * series[i] + (1 - alpha) * result[i - 1]);
  return result;
}

export function linearTrend(series: number[]): { slope: number; intercept: number } {
  if (series.length < 2) return { slope: 0, intercept: series[0] ?? 0 };
  const n = series.length;
  const xMean = (n - 1) / 2;
  const yMean = series.reduce((s, v) => s + v, 0) / n;
  let numerator = 0;
  let denominator = 0;
  for (let x = 0; x < n; x += 1) { numerator += (x - xMean) * (series[x] - yMean); denominator += (x - xMean) ** 2; }
  const slope = denominator ? numerator / denominator : 0;
  return { slope, intercept: yMean - slope * xMean };
}

export function forecast(series: TimePoint[], horizon = 7, volatility = 0.1): ForecastPoint[] {
  const values = series.map(p => p.value);
  const trend = linearTrend(values);
  const residuals = values.map((v, i) => v - (trend.intercept + trend.slope * i));
  const residualStd = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / Math.max(1, residuals.length - 1));
  const lastDate = series.length ? new Date(series[series.length - 1].timestamp) : new Date();
  return Array.from({ length: horizon }, (_, h) => {
    const x = values.length + h;
    const value = trend.intercept + trend.slope * x;
    const width = residualStd * (1 + volatility * h);
    const date = new Date(lastDate); date.setDate(date.getDate() + h + 1);
    return { timestamp: date.toISOString(), value, lower: value - width, upper: value + width };
  });
}

export function forecastBias(actual: number[], predicted: number[]): number {
  const length = Math.min(actual.length, predicted.length);
  if (!length) return 0;
  return actual.slice(0, length).reduce((sum, value, i) => sum + (value - predicted[i]), 0) / length;
}

export function meanAbsolutePercentageError(actual: number[], predicted: number[]): number {
  const length = Math.min(actual.length, predicted.length);
  if (!length) return 0;
  return actual.slice(0, length).reduce((sum, value, i) => sum + Math.abs((value - predicted[i]) / Math.max(1e-9, Math.abs(value))), 0) / length;
}
