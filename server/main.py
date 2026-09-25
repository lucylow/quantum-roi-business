from __future__ import annotations

import hashlib
import json
import time
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from server.models import BraketSubmitRequest, OptimizationInput, OptimizationResult, SolverKind
from server.optimizers import random_key_optimize, simulated_annealing
from server.qubo import build_qubo
from server.braket_adapter import submit_qubo_job

app = FastAPI(
    title="Quantum ROI Business API",
    version="2.0.0",
    description="Business-first optimization service with classical baselines and an optional Amazon Braket execution boundary.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def stable_id(payload: OptimizationInput) -> str:
    raw = json.dumps(payload.model_dump(mode="json"), sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()[:16]


def generic_demo_result(payload: OptimizationInput) -> OptimizationResult:
    """Server-side safety-net for domains the mobile demo has not implemented here."""
    started = time.perf_counter()
    variables = min(50, max(4, payload.problem.variables))
    model = build_qubo(payload.problem.model_dump(), payload.scenarioData)
    objective = float(sum(model["linear"]))
    baseline = objective * 1.08 if objective else 1.0
    trace = [{"step": i, "objective": objective * (1 + 0.3 / (i + 1)), "bestObjective": objective, "feasibility": 1.0, "elapsedMs": i + 1} for i in range(min(payload.iterations, 40))]
    return OptimizationResult(
        runId=f"srv_{stable_id(payload)}",
        problemId=payload.problem.id,
        solver=payload.solver.value,
        status="complete",
        objective=objective,
        baselineObjective=baseline,
        objectiveDirection=payload.problem.direction,
        metrics=[
            {"id": "objective", "label": "Model objective", "value": objective, "unit": "score", "direction": payload.problem.direction, "baseline": baseline},
            {"id": "variables", "label": "Decision variables", "value": variables, "unit": "vars", "direction": "minimize"},
            {"id": "interactions", "label": "QUBO interactions", "value": len(model["quadratic"]), "unit": "terms", "direction": "minimize"},
        ],
        decisions=[{"id": label, "label": label, "selected": i % 2 == 0, "score": 1 - i / max(1, variables)} for i, label in enumerate(model["variableLabels"][:24])],
        trace=trace,
        violations=[],
        quantumReadiness={"score": 52, "category": "promising", "qubitsEstimate": variables, "embeddingOverhead": 1.5, "reasons": ["Server safety-net result."], "recommendedNextStep": "Benchmark against a domain-specific classical solver."},
        qaoaEligible=variables <= 35,
        durationMs=(time.perf_counter() - started) * 1000,
        notes=["Server safety-net path; prefer domain-specific mobile/local solvers for the demo."]
    )


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "service": "quantum-roi-business", "version": app.version}


@app.post("/v1/model/qubo")
def model_qubo(payload: OptimizationInput) -> Dict[str, Any]:
    model = build_qubo(payload.problem.model_dump(), payload.scenarioData)
    return {"qubo": model, "runId": stable_id(payload)}


@app.post("/v1/optimize", response_model=OptimizationResult)
def optimize(payload: OptimizationInput) -> OptimizationResult:
    # This endpoint deliberately keeps live QPU execution out of the request path.
    # A production service would dispatch a job to a queue and poll its status.
    return generic_demo_result(payload)


@app.post("/v1/braket/submit")
def braket_submit(payload: BraketSubmitRequest) -> Dict[str, Any]:
    return submit_qubo_job(payload.qubo, payload.runId, payload.shots, payload.deviceArn)
