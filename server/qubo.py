from __future__ import annotations

from typing import Dict, Iterable, List, Tuple


def pair_key(i: int, j: int) -> str:
    return f"{min(i, j)},{max(i, j)}"


def empty_qubo(n: int, labels: List[str]) -> dict:
    return {"n": n, "offset": 0.0, "linear": [0.0] * n, "quadratic": {}, "variableLabels": labels, "constraints": []}


def add_linear(model: dict, i: int, c: float) -> None:
    model["linear"][i] += c


def add_quadratic(model: dict, i: int, j: int, c: float) -> None:
    if i == j:
        add_linear(model, i, c)
        return
    key = pair_key(i, j)
    model["quadratic"][key] = model["quadratic"].get(key, 0.0) + c


def exactly_one(model: dict, indices: Iterable[int], penalty: float, label: str) -> None:
    items = list(dict.fromkeys(indices))
    for i in items:
        add_linear(model, i, -penalty)
    for pos, i in enumerate(items):
        for j in items[pos + 1 :]:
            add_quadratic(model, i, j, 2 * penalty)
    model["offset"] += penalty
    model["constraints"].append(f"{label}: exactly one")


def build_qubo(problem: dict, data: dict) -> dict:
    domain = problem.get("domain")
    if domain == "portfolio":
        assets = data.get("assets", [])
        labels = [a.get("id", f"a{i}") for i, a in enumerate(assets)]
        model = empty_qubo(len(labels), labels)
        for i, asset in enumerate(assets):
            add_linear(model, i, -float(asset.get("expectedReturn", 0)) + 0.45 * float(asset.get("risk", 0)))
        model["constraints"].append("Portfolio cap: configurable maximum holdings")
        return model

    if domain == "workforce":
        workers = data.get("workers", [])[:8]
        shifts = data.get("shifts", [])
        n = len(workers) * len(shifts)
        labels = [f"{s.get('id','s')}_{w.get('id','w')}" for w in workers for s in shifts]
        model = empty_qubo(n, labels)
        for s_index, shift in enumerate(shifts):
            exactly_one(model, [w_index * len(shifts) + s_index for w_index in range(len(workers))], 8.0, shift.get("id", f"shift-{s_index}"))
        return model

    if domain == "delivery":
        stops = [s for s in data.get("stops", []) if s.get("type") != "warehouse"]
        vehicles = data.get("vehicles", [])
        n = min(40, max(4, len(stops) * max(1, len(vehicles))))
        labels = [f"stop_{i % max(1,len(stops))}_vehicle_{i // max(1,len(stops))}" for i in range(n)]
        model = empty_qubo(n, labels)
        for i, stop in enumerate(stops):
            candidates = [(i + v * len(stops)) % n for v in range(max(1, len(vehicles)))]
            exactly_one(model, candidates, 5.0, stop.get("id", f"stop-{i}"))
        return model

    if domain == "robotics":
        tasks = data.get("tasks", [])
        robots = int(data.get("robots", 3))
        n = min(48, max(4, len(tasks) * max(1, robots)))
        labels = [f"task_{i % max(1,len(tasks))}_robot_{i // max(1,len(tasks))}" for i in range(n)]
        model = empty_qubo(n, labels)
        for i, task in enumerate(tasks):
            candidates = [(i + r * len(tasks)) % n for r in range(max(1, robots))]
            exactly_one(model, candidates, 6.0, task.get("id", f"task-{i}"))
        return model

    n = int(problem.get("variables", 16))
    return empty_qubo(min(50, max(4, n)), [f"x{i}" for i in range(min(50, max(4, n)))])
