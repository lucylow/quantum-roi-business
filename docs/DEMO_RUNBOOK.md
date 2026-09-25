# 7-Minute Demo Runbook

## Opening: 45 seconds

Say: “This is not a quantum calculator. It is a decision lab for the kinds of hard optimization problems that show up in logistics, workforce, finance, and manufacturing.”

Open **Use cases**.

## Act 1: next-day delivery, 2 minutes

Choose **Next-day delivery network**.

Explain the problem: multiple vehicles, service windows, capacity, distance, and cost. The talk specifically discusses the middle-mile network and its relationship to revenue and customer satisfaction, with heuristic random-key optimization and constraint programming approaches. fileciteturn0file0L253-L277

Run **RKO** with seed 42.

On results, point to:

- route operating cost,
- network distance,
- on-time stops,
- driver time,
- convergence trace.

Say: “The business person sees routes and dollars. The optimization person sees an objective and constraints.”

## Act 2: reveal the quantum layer, 90 seconds

Tap **Inspect QUBO**.

Show logical variables, interactions, constraints, and Ising coefficients.

Say: “The quantum layer starts only after the problem is formulated. The QUBO is not decoration; it is the bridge between the business decision and a quantum execution model.”

## Act 3: quantum readiness, 60 seconds

Return to results. Show the readiness card.

Emphasize that the score is triage, not a forecast of quantum advantage.

Tap **Experiment Lab**.

Show the staged execution path:

```text
Business problem
      ↓
Classical baseline
      ↓
QUBO / Ising
      ↓
Braket simulator
      ↓
QPU benchmark
```

The Braket documentation supports both simulators and QPUs and documents hybrid algorithms such as QAOA. citeturn197076search0turn197076search7turn197076search8

## Act 4: swap industries, 90 seconds

Return to use cases and open **Workforce rostering** or **Robot seam-path planning**.

Say: “The solver infrastructure stays the same; the decoder and business model change.”

The talk gives examples of workforce rostering with a large classical constraint-programming formulation and robot path planning with both a quantum proof of concept and a scalable RKO implementation. fileciteturn0file0L209-L225 fileciteturn0file0L324-L339

## Close: 30 seconds

Open **Settings / Governance**.

Say: “The thing I want this product to prove is not that quantum wins every problem. It is that an enterprise can go from business problem to reproducible optimization experiment without losing the business context.”

## What to avoid saying

Do not say that the app proves quantum advantage, guarantees savings, or represents a production Amazon system. It is a research-oriented prototype inspired by publicly presented examples.
