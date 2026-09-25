from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Literal, Union
from pydantic import BaseModel, Field


class SolverKind(str, Enum):
    rko = "rko"
    simulatedAnnealing = "simulatedAnnealing"
    greedy = "greedy"
    quantumMock = "quantumMock"
    braket = "braket"


class Constraint(BaseModel):
    id: str
    label: str
    type: Literal["hard", "soft"]
    penalty: float
    enabled: bool = True
    description: str


class OptimizationProblem(BaseModel):
    id: str
    name: str
    domain: str
    description: str
    objective: str
    direction: Literal["minimize", "maximize"]
    scale: float
    variables: int
    constraints: List[Constraint] = Field(default_factory=list)
    assumptions: List[Dict[str, Any]] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class OptimizationInput(BaseModel):
    problem: OptimizationProblem
    solver: SolverKind
    seed: int = Field(default=42, ge=1, le=2_000_000_000)
    iterations: int = Field(default=30, ge=4, le=500)
    scenarioData: Dict[str, Any]


class OptimizationResult(BaseModel):
    runId: str
    problemId: str
    solver: str
    status: str
    objective: float
    baselineObjective: float
    objectiveDirection: str
    metrics: List[Dict[str, Any]]
    decisions: List[Dict[str, Any]]
    trace: List[Dict[str, Any]]
    violations: List[str]
    quantumReadiness: Dict[str, Any]
    qaoaEligible: bool
    durationMs: float
    notes: List[str]


class BraketSubmitRequest(BaseModel):
    deviceArn: str
    shots: int = Field(default=1000, ge=1, le=1_000_000)
    qubo: Dict[str, Any]
    runId: str
