from __future__ import annotations

import math
import random
from typing import Callable, List, Sequence, Tuple


def seeded(seed: int) -> random.Random:
    return random.Random(seed)


def random_key_optimize(
    dimensions: int,
    population_size: int,
    iterations: int,
    seed: int,
    decoder: Callable[[List[float]], List[int]],
    fitness: Callable[[List[int]], float],
) -> Tuple[List[int], float, List[dict]]:
    rng = seeded(seed)
    population = [[rng.random() for _ in range(dimensions)] for _ in range(max(8, population_size))]
    scored = [(fitness(decoder(x)), x) for x in population]
    scored.sort(key=lambda p: p[0])
    best_score, best_keys = scored[0]
    trace = []

    for step in range(iterations):
        scored.sort(key=lambda p: p[0])
        elites = scored[: max(2, len(scored) // 4)]
        next_population = [list(keys) for _, keys in elites]
        while len(next_population) < len(population):
            parent = rng.choice(elites)[1]
            sibling = rng.choice(elites)[1]
            child = []
            for i in range(dimensions):
                base = parent[i] if rng.random() < 0.5 else sibling[i]
                child.append(min(1.0, max(0.0, base + (rng.random() - 0.5) * 0.35)))
            next_population.append(child)
        scored = [(fitness(decoder(keys)), keys) for keys in next_population]
        current_score, current_keys = min(scored, key=lambda p: p[0])
        if current_score < best_score:
            best_score, best_keys = current_score, current_keys
        trace.append({
            "step": step,
            "objective": current_score,
            "bestObjective": best_score,
            "feasibility": 1.0,
            "elapsedMs": step + 1,
        })

    return decoder(best_keys), best_score, trace


def greedy_assignment(count: int, buckets: int) -> List[int]:
    return [i % max(1, buckets) for i in range(count)]


def simulated_annealing(
    initial: Sequence[float],
    iterations: int,
    seed: int,
    objective: Callable[[List[float]], float],
) -> Tuple[List[float], float, List[dict]]:
    rng = seeded(seed)
    current = list(initial)
    current_value = objective(current)
    best = list(current)
    best_value = current_value
    trace = []
    start_t = 1.0
    end_t = 0.02

    for step in range(iterations):
        progress = step / max(1, iterations - 1)
        temperature = start_t * ((end_t / start_t) ** progress)
        candidate = list(current)
        if candidate:
            index = rng.randrange(len(candidate))
            candidate[index] = min(1.0, max(0.0, candidate[index] + rng.uniform(-0.5, 0.5)))
        candidate_value = objective(candidate)
        delta = candidate_value - current_value
        if delta <= 0 or rng.random() < math.exp(-delta / max(temperature, 1e-12)):
            current = candidate
            current_value = candidate_value
        if current_value < best_value:
            best = list(current)
            best_value = current_value
        trace.append({"step": step, "objective": current_value, "bestObjective": best_value, "feasibility": 1.0, "elapsedMs": step + 1})

    return best, best_value, trace
