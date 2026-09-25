import { seededRandom } from './math';

export interface GraphNode { id: string; label: string; weight?: number; }
export interface GraphEdge { a: string; b: string; weight: number; }
export interface Graph { nodes: GraphNode[]; edges: GraphEdge[]; }

export function graphDensity(graph: Graph): number {
  const n = graph.nodes.length;
  if (n < 2) return 0;
  return graph.edges.length / (n * (n - 1) / 2);
}

export function adjacency(graph: Graph): Map<string, Array<{ node: string; weight: number }>> {
  const map = new Map<string, Array<{ node: string; weight: number }>>();
  graph.nodes.forEach((node) => map.set(node.id, []));
  graph.edges.forEach((edge) => {
    map.get(edge.a)?.push({ node: edge.b, weight: edge.weight });
    map.get(edge.b)?.push({ node: edge.a, weight: edge.weight });
  });
  return map;
}

export function degreeMap(graph: Graph): Map<string, number> {
  const result = new Map<string, number>();
  graph.nodes.forEach((node) => result.set(node.id, 0));
  graph.edges.forEach((edge) => {
    result.set(edge.a, (result.get(edge.a) ?? 0) + 1);
    result.set(edge.b, (result.get(edge.b) ?? 0) + 1);
  });
  return result;
}

export function connectedComponents(graph: Graph): string[][] {
  const adj = adjacency(graph);
  const visited = new Set<string>();
  const components: string[][] = [];
  graph.nodes.forEach((node) => {
    if (visited.has(node.id)) return;
    const queue = [node.id];
    visited.add(node.id);
    const component: string[] = [];
    while (queue.length) {
      const current = queue.shift()!;
      component.push(current);
      adj.get(current)?.forEach(({ node: neighbor }) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }
    components.push(component);
  });
  return components;
}

export function randomGraph(nodeCount: number, density: number, seed: number): Graph {
  const random = seededRandom(seed);
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({ id: `n${i}`, label: `Node ${i + 1}`, weight: 0.5 + random() * 2 }));
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodeCount; i += 1) {
    for (let j = i + 1; j < nodeCount; j += 1) {
      if (random() <= density) edges.push({ a: `n${i}`, b: `n${j}`, weight: Number((0.2 + random() * 2).toFixed(3)) });
    }
  }
  return { nodes, edges };
}

export function weightedDegree(graph: Graph, nodeId: string): number {
  return graph.edges.reduce((sum, edge) => {
    if (edge.a === nodeId || edge.b === nodeId) return sum + edge.weight;
    return sum;
  }, 0);
}

export function inducedSubgraph(graph: Graph, nodeIds: string[]): Graph {
  const keep = new Set(nodeIds);
  return {
    nodes: graph.nodes.filter((node) => keep.has(node.id)),
    edges: graph.edges.filter((edge) => keep.has(edge.a) && keep.has(edge.b))
  };
}

export function greedyMaxIndependentSet(graph: Graph): string[] {
  const remaining = new Set(graph.nodes.map((node) => node.id));
  const degrees = degreeMap(graph);
  const result: string[] = [];
  while (remaining.size) {
    const chosen = [...remaining].sort((a, b) => (degrees.get(a) ?? 0) - (degrees.get(b) ?? 0))[0];
    result.push(chosen);
    remaining.delete(chosen);
    graph.edges.forEach((edge) => {
      if (edge.a === chosen) remaining.delete(edge.b);
      if (edge.b === chosen) remaining.delete(edge.a);
    });
  }
  return result;
}

export function isIndependentSet(graph: Graph, nodes: string[]): boolean {
  const keep = new Set(nodes);
  return !graph.edges.some((edge) => keep.has(edge.a) && keep.has(edge.b));
}

export function maxCutValue(graph: Graph, sideA: Set<string>): number {
  return graph.edges.reduce((value, edge) => {
    const crosses = sideA.has(edge.a) !== sideA.has(edge.b);
    return value + (crosses ? edge.weight : 0);
  }, 0);
}

export function partitionByIndex(graph: Graph): [Set<string>, Set<string>] {
  const a = new Set<string>();
  const b = new Set<string>();
  graph.nodes.forEach((node, index) => (index % 2 === 0 ? a : b).add(node.id));
  return [a, b];
}

export function graphSummary(graph: Graph): Record<string, number> {
  return {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    density: graphDensity(graph),
    components: connectedComponents(graph).length,
    maxDegree: Math.max(0, ...degreeMap(graph).values())
  };
}

export function removeLowDegreeNodes(graph: Graph, threshold: number): Graph {
  const degree = degreeMap(graph);
  return inducedSubgraph(graph, graph.nodes.filter((node) => (degree.get(node.id) ?? 0) >= threshold).map((node) => node.id));
}
