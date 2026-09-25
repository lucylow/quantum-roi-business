from __future__ import annotations

import hashlib
import json
import os
import time
import uuid
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from server.braket_adapter import submit_qubo_job
from server.models import BraketSubmitRequest, OptimizationInput, OptimizationResult
from server.qubo import build_qubo
from server.security import allowed_origins, live_braket_enabled, max_request_bytes, safe_device_arn
from server.limits import InMemoryRateLimiter
from server.observability import log_event
from server.request_validation import validate_json_depth


APP_VERSION = "2.0.1"

rate_limiter = InMemoryRateLimiter(limit=int(os.getenv("RATE_LIMIT_PER_MINUTE", "60")), window_seconds=60)

app = FastAPI(
    title="Quantum ROI Business API",
    version=APP_VERSION,
    description="Business-first optimization service with classical baselines and an optional Amazon Braket execution boundary.",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Accept", "Content-Type", "X-Request-ID"],
)


@app.middleware("http")
async def request_guard(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or uuid.uuid4().hex
    started = time.perf_counter()

    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > max_request_bytes():
                return JSONResponse(status_code=413, content={"error": "request_too_large", "requestId": request_id})
        except ValueError:
            return JSONResponse(status_code=400, content={"error": "invalid_content_length", "requestId": request_id})

    client_key = request.client.host if request.client else "anonymous"
    if not rate_limiter.allow(client_key):
        return JSONResponse(status_code=429, content={"error": "rate_limited", "requestId": request_id})

    try:
        response = await call_next(request)
    except HTTPException:
        raise
    except Exception as exc:
        # Never expose stack traces or credentials in an API response.
        if os.getenv("APP_ENV", "production") != "production":
            print(f"[{request_id}] unhandled error: {exc!r}")
        response = JSONResponse(status_code=500, content={"error": "internal_server_error", "requestId": request_id})

    response.headers["x-request-id"] = request_id
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["x-frame-options"] = "DENY"
    response.headers["cache-control"] = "no-store"
    response.headers["server-timing"] = f"app;dur={(time.perf_counter() - started) * 1000:.2f}"
    log_event("request", request_id, method=request.method, path=request.url.path, status=response.status_code)
    return response


def stable_id(payload: OptimizationInput) -> str:
    raw = payload.model_dump_json().encode()
    return hashlib.sha256(raw).hexdigest()[:16]


def bounded_float(value: float, fallback: float = 0.0) -> float:
    return value if value == value and abs(value) < 1e18 else fallback


def generic_demo_result(payload: OptimizationInput) -> OptimizationResult:
    started = time.perf_counter()
    model = build_qubo(payload.problem.model_dump(), payload.scenarioData)
    variables = len(model["variableLabels"])
    linear_sum = sum(float(x) for x in model["linear"])
    objective = bounded_float(linear_sum)
    baseline = bounded_float(objective * 1.08 if objective else 1.0, 1.0)
    iterations = min(payload.iterations, 40)
    trace = [
        {
            "step": i,
            "objective": objective * (1 + 0.3 / (i + 1)),
            "bestObjective": objective,
            "feasibility": 1.0,
            "elapsedMs": i + 1,
        }
        for i in range(iterations)
    ]
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
        decisions=[
            {"id": label, "label": label, "selected": i % 2 == 0, "score": 1 - i / max(1, variables)}
            for i, label in enumerate(model["variableLabels"][:24])
        ],
        trace=trace,
        violations=[],
        quantumReadiness={
            "score": 52,
            "category": "promising",
            "qubitsEstimate": variables,
            "embeddingOverhead": 1.5,
            "reasons": ["Server safety-net result."],
            "recommendedNextStep": "Benchmark against a domain-specific classical solver.",
        },
        qaoaEligible=variables <= 35,
        durationMs=(time.perf_counter() - started) * 1000,
        notes=["Server safety-net path; prefer domain-specific mobile/local solvers for the demo."],
    )


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "service": "quantum-roi-business",
        "version": APP_VERSION,
        "liveBraketEnabled": live_braket_enabled(),
    }


@app.post("/v1/model/qubo")
def model_qubo(payload: OptimizationInput) -> Dict[str, Any]:
    issues = validate_json_depth(payload.scenarioData)
    if issues:
        raise HTTPException(status_code=413, detail=" ".join(issues[:3]))
    model = build_qubo(payload.problem.model_dump(), payload.scenarioData)
    return {"qubo": model, "runId": stable_id(payload)}


@app.post("/v1/optimize", response_model=OptimizationResult)
def optimize(payload: OptimizationInput) -> OptimizationResult:
    issues = validate_json_depth(payload.scenarioData)
    if issues:
        raise HTTPException(status_code=413, detail=" ".join(issues[:3]))
    return generic_demo_result(payload)


@app.post("/v1/braket/submit")
def braket_submit(payload: BraketSubmitRequest) -> Dict[str, Any]:
    if not live_braket_enabled():
        return {
            "status": "blocked",
            "taskId": f"blocked-{payload.runId}",
            "message": "Live Braket execution is disabled. Enable it explicitly on the server after configuring IAM, S3, device allowlists, quotas, and cost controls.",
        }
    if not safe_device_arn(payload.deviceArn):
        raise HTTPException(status_code=400, detail="Invalid Braket device ARN.")
    result = submit_qubo_job(payload.qubo, payload.runId, payload.shots, payload.deviceArn)
    return result
