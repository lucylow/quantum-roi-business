# Quantum ROI Business — Architecture

## 1. Product thesis

Quantum ROI Business is a mobile decision laboratory for operational optimization. The core product decision is deliberately not “which quantum algorithm should I demo?” It is “what business decision is expensive because the search space is combinatorial?”

The app follows the talk's problem-focused framing: work backwards from the industry problem, keep the solver interchangeable, and make the economic output readable to a stakeholder. The talk describes robot path optimization, portfolio optimization, workforce rostering, next-day delivery, and a wider Amazon Advanced Solutions Lab portfolio of optimization use cases. fileciteturn0file0L298-L303 fileciteturn0file0L363-L371

## 2. Layering

```text
┌───────────────────────────────────────────────────────────┐
│                    Mobile Decision Lab                    │
│ Home · Use Cases · Scenario · Results · QUBO · Lab       │
└───────────────────────────────┬───────────────────────────┘
                                │ typed OptimizationInput
                                ▼
┌───────────────────────────────────────────────────────────┐
│                  Domain Modeling Layer                    │
│ Delivery · Workforce · Portfolio · Robotics              │
│ objective · constraints · assumptions · decisions        │
└───────────────────────────────┬───────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
         ┌──────────────────┐      ┌────────────────────┐
         │ Classical Engine │      │ Quantum Formulator │
         │ RKO / annealing  │      │ QUBO / Ising       │
         │ greedy baseline  │      │ readiness / QAOA   │
         └─────────┬────────┘      └─────────┬──────────┘
                   │                         │
                   └────────────┬────────────┘
                                ▼
┌───────────────────────────────────────────────────────────┐
│                  Business Translation                     │
│ cost · service · throughput · capacity · risk · value    │
└───────────────────────────────┬───────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────┐
│                    Server / Cloud Boundary                 │
│ API · auth · audit · job queue · S3 · Braket adapter     │
└───────────────────────────────┬───────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────┐
│                      Amazon Braket                       │
│ QPU / simulator / hybrid jobs / quantum tasks            │
└───────────────────────────────────────────────────────────┘
```

## 3. Why the mobile app is intentionally local-first

The user interface needs to feel instant while the experiment is being shaped. A mobile demo also should not carry cloud credentials. Live quantum execution is therefore a backend capability. The Braket developer guide describes quantum tasks as requests to a device, with results stored to S3 and integrations with IAM, CloudWatch, CloudTrail, and EventBridge. citeturn197076search5

## 4. Solver boundary

The `randomKeyOptimize` function implements problem-independent search. The decoder maps continuous random keys to a domain-specific decision, while the fitness function scores feasibility and cost. This follows the talk's separation between a problem-independent search mechanism and problem-dependent decoding / fitness evaluation. fileciteturn0file0L747-L759

## 5. QUBO boundary

The app exposes:

```text
binary x ∈ {0,1}
        ↓
      QUBO
 H(x) = xᵀ Q x
        ↓
   x = (1 - z) / 2
        ↓
     Ising H(z)
```

The talk explicitly presents QUBO and Ising as the quantum-native formulation accepted by quantum annealers or hybrid QAOA. fileciteturn0file0L653-L670

## 6. Hardware reality

Current Braket documentation lists QPUs from AQT, IonQ, IQM, QuEra, and Rigetti, alongside managed and local simulators. The application never hardcodes the assumption that one device is always available or superior. A production controller should inspect device properties and select a compatible backend. citeturn197076search0turn197076search1

## 7. Success criteria

The app succeeds when a technical reviewer can answer, from one run:

1. What decision are we optimizing?
2. Which constraints are hard versus soft?
3. What was the classical baseline?
4. What changed in the optimized plan?
5. What is the modeled business value?
6. How many logical variables and pairwise terms exist?
7. Is a quantum experiment technically sensible?
8. What would be required to reproduce the test on Braket?

A result is deliberately not labeled “quantum advantage” merely because it comes from a quantum path.
