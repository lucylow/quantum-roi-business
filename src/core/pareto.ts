export interface ParetoPoint<T = unknown> { id: string; metrics: number[]; payload: T; }

function dominates(a: number[], b: number[], maximize: boolean[]): boolean {
  let strictlyBetter = false;
  for (let i = 0; i < a.length; i += 1) {
    const aValue = maximize[i] ? a[i] : -a[i];
    const bValue = maximize[i] ? b[i] : -b[i];
    if (aValue < bValue) return false;
    if (aValue > bValue) strictlyBetter = true;
  }
  return strictlyBetter;
}

export function paretoFrontier<T>(points: ParetoPoint<T>[], maximize: boolean[]): ParetoPoint<T>[] {
  return points.filter((candidate, index) => points.every((other, otherIndex) => index === otherIndex || !dominates(other.metrics, candidate.metrics, maximize)));
}

export function crowdingDistance(points: ParetoPoint[]): Map<string, number> {
  const distance = new Map(points.map(p => [p.id, 0]));
  if (points.length <= 2) { points.forEach(p => distance.set(p.id, Number.POSITIVE_INFINITY)); return distance; }
  const dimensions = points[0]?.metrics.length ?? 0;
  for (let dimension = 0; dimension < dimensions; dimension += 1) {
    const ordered = [...points].sort((a, b) => a.metrics[dimension] - b.metrics[dimension]);
    distance.set(ordered[0].id, Number.POSITIVE_INFINITY);
    distance.set(ordered[ordered.length - 1].id, Number.POSITIVE_INFINITY);
    const min = ordered[0].metrics[dimension];
    const max = ordered[ordered.length - 1].metrics[dimension];
    const range = Math.max(1e-9, max - min);
    for (let i = 1; i < ordered.length - 1; i += 1) {
      if (!Number.isFinite(distance.get(ordered[i].id)!)) continue;
      const contribution = (ordered[i + 1].metrics[dimension] - ordered[i - 1].metrics[dimension]) / range;
      distance.set(ordered[i].id, (distance.get(ordered[i].id) ?? 0) + contribution);
    }
  }
  return distance;
}

export function selectBalanced<T>(points: ParetoPoint<T>[], maximize: boolean[]): ParetoPoint<T> | null {
  const frontier = paretoFrontier(points, maximize);
  if (!frontier.length) return null;
  const ideal = frontier[0].metrics.map((_, dimension) => {
    const values = frontier.map(p => p.metrics[dimension]);
    return maximize[dimension] ? Math.max(...values) : Math.min(...values);
  });
  return frontier.reduce((best, point) => {
    const score = point.metrics.reduce((sum, value, dimension) => {
      const span = Math.max(1e-9, Math.max(...frontier.map(p => p.metrics[dimension])) - Math.min(...frontier.map(p => p.metrics[dimension])));
      return sum + Math.abs(value - ideal[dimension]) / span;
    }, 0);
    const bestScore = best.metrics.reduce((sum, value, dimension) => {
      const span = Math.max(1e-9, Math.max(...frontier.map(p => p.metrics[dimension])) - Math.min(...frontier.map(p => p.metrics[dimension])));
      return sum + Math.abs(value - ideal[dimension]) / span;
    }, 0);
    return score < bestScore ? point : best;
  }, frontier[0]);
}

export function frontierSummary<T>(points: ParetoPoint<T>[], maximize: boolean[]): string[] {
  const frontier = paretoFrontier(points, maximize);
  return [
    `Candidates: ${points.length}`,
    `Pareto frontier: ${frontier.length}`,
    frontier.length ? `Balanced candidate: ${selectBalanced(frontier, maximize)?.id ?? 'n/a'}` : 'Balanced candidate: n/a'
  ];
}
