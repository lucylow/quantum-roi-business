# Data Model

## OptimizationProblem

```text
id
name
domain
description
objective
direction
scale
variables
constraints[]
assumptions[]
tags[]
```

The domain describes a business family, not a solver.

## OptimizationInput

```text
problem
solver
seed
iterations
scenarioData
```

The `seed` and `iterations` are first-class because reproducibility matters when comparing solver variants.

## OptimizationResult

```text
runId
problemId
solver
status
objective
baselineObjective
objectiveDirection
metrics[]
decisions[]
trace[]
violations[]
quantumReadiness
qaoaEligible
durationMs
notes[]
```

## ExperimentRun

An experiment run is the unit of collaboration and later evidence packaging. The mobile app stores the run ID, scenario, solver, result, and timestamp in memory for the demo. A production system should persist a versioned immutable manifest.

## Versioned experiment manifest

A production record should additionally include:

- application version,
- solver package version,
- model schema version,
- normalized input hash,
- random seed,
- constraint set hash,
- objective weights,
- source dataset snapshot ID,
- QUBO hash,
- backend / device ARN,
- shots or iterations,
- runtime cost,
- postprocessing version.

This is essential for a credible technical comparison.
