# Research Notes and Product Grounding

## Source-driven themes

The attached talk material presents several recurring patterns:

- problem-focused research: work backwards from the problem and remain tool-agnostic, alongside method-focused research; fileciteturn0file0L298-L303
- portfolio optimization using a hybrid pipeline where a classical solver reduces the graph and a quantum device approximates a kernel; fileciteturn0file0L149-L177
- workforce rostering with a state-of-the-art classical solution and scenario analysis; fileciteturn0file0L209-L225
- next-day delivery using random-key optimization and constraint programming; fileciteturn0file0L253-L277
- robot path optimization with both a Braket quantum proof of concept and a scalable random-key optimizer; fileciteturn0file0L324-L339
- RKO as problem-independent search plus problem-dependent decoder/fitness evaluation; fileciteturn0file0L747-L759
- QUBO and Ising as quantum-native formulations; fileciteturn0file0L653-L670
- practical hardware embedding overhead as a real engineering consideration. fileciteturn0file0L689-L705

## Product interpretation

The product turns those themes into an interaction loop:

```text
business question
  → measurable objective
  → explicit constraints
  → classical benchmark
  → quantum formulation
  → quantum-readiness review
  → controlled experiment
  → business translation
```

This is intentionally narrower than a general “AI + quantum” assistant. A strong enterprise demo should have a defensible decision model before it has a sophisticated quantum circuit.

## Amazon relevance

The talk's ASL slide lists vehicle routing, flight scheduling, sports scheduling, workforce rostering, ad placement, clinical trial enrollment, manufacturing process optimization, forecasting, portfolio optimization, reinsurance, middle-mile network optimization, and energy unit commitment as example use cases. fileciteturn0file0L363-L371

That breadth motivates the app's modular architecture: new use cases should mostly add a decoder, objective, constraint model, and business-impact mapper rather than require a new mobile experience.

## Claims discipline

The app intentionally distinguishes:

- “optimized under this model” from “globally optimal,”
- “quantum experiment queued” from “quantum advantage,”
- “scenario savings” from “realized production savings,”
- “quantum-ready” from “better than classical.”

This distinction is central to a credible enterprise-facing research prototype.
