from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class SolverKind(str, Enum):
    rko = "rko"
    simulatedAnnealing = "simulatedAnnealing"
    greedy = "greedy"
    quantumMock = "quantumMock"
    braket = "braket"


class Constraint(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1, max_length=120)
    label: str = Field(min_length=1, max_length=200)
    type: Literal["hard", "soft"]
    penalty: float = Field(ge=0, le=1_000_000)
    enabled: bool = True
    description: str = Field(min_length=1, max_length=1_000)


class OptimizationProblem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=200)
    domain: Literal[
        "delivery",
        "workforce",
        "portfolio",
        "robotics",
        "adPlacement",
        "manufacturing",
        "energy",
        "generic",
    ]
    description: str = Field(min_length=1, max_length=2_000)
    objective: str = Field(min_length=1, max_length=500)
    direction: Literal["minimize", "maximize"]
    scale: float = Field(gt=0, le=1_000_000_000)
    variables: int = Field(ge=1, le=500)
    constraints: List[Constraint] = Field(default_factory=list, max_length=250)
    assumptions: List[Dict[str, Any]] = Field(default_factory=list, max_length=250)
    tags: List[str] = Field(default_factory=list, max_length=50)

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, value: List[str]) -> List[str]:
        return [item.strip()[:80] for item in value if item and item.strip()]


class OptimizationInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    problem: OptimizationProblem
    solver: SolverKind
    seed: int = Field(default=42, ge=1, le=2_000_000_000)
    iterations: int = Field(default=30, ge=4, le=500)
    scenarioData: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("scenarioData")
    @classmethod
    def bound_scenario_size(cls, value: Dict[str, Any]) -> Dict[str, Any]:
        # JSON payloads over ~1 MB are rejected at the HTTP middleware layer;
        # this additionally keeps the parsed top-level object bounded.
        if len(value) > 200:
            raise ValueError("scenarioData has too many top-level fields")
        return value


class OptimizationResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    runId: str = Field(min_length=1, max_length=120)
    problemId: str = Field(min_length=1, max_length=120)
    solver: str = Field(min_length=1, max_length=80)
    status: str = Field(min_length=1, max_length=40)
    objective: float
    baselineObjective: float
    objectiveDirection: str
    metrics: List[Dict[str, Any]] = Field(default_factory=list, max_length=100)
    decisions: List[Dict[str, Any]] = Field(default_factory=list, max_length=1_000)
    trace: List[Dict[str, Any]] = Field(default_factory=list, max_length=500)
    violations: List[str] = Field(default_factory=list, max_length=250)
    quantumReadiness: Dict[str, Any] = Field(default_factory=dict)
    qaoaEligible: bool
    durationMs: float = Field(ge=0, le=10_000_000)
    notes: List[str] = Field(default_factory=list, max_length=100)


class BraketSubmitRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deviceArn: str = Field(min_length=1, max_length=300)
    shots: int = Field(default=1000, ge=1, le=1_000_000)
    qubo: Dict[str, Any]
    runId: str = Field(min_length=1, max_length=120)
