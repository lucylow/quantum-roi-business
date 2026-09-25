# Quantum ROI Business — Decision Lab

A mobile-first proof-of-concept for business optimization inspired by the optimization examples in Dr. Martin Schuetz's Amazon Advanced Solutions Lab career talk.

## Why this version is different

The product is built around the idea that **the business problem should come before the quantum algorithm**. The talk explicitly distinguishes problem-focused research (working backwards from the problem) from method-focused research. fileciteturn0file0L298-L303

Instead of shipping a quantum-themed dashboard, this repository provides a reusable mobile workflow:

```text
Business problem
      ↓
Scenario + assumptions
      ↓
Classical baseline
      ↓
RKO / annealing / greedy
      ↓
Business KPI translation
      ↓
QUBO / Ising inspection
      ↓
Quantum readiness
      ↓
Braket experiment boundary
      ↓
Reproducible experiment brief
```

## Talk-inspired use cases

The included mobile demo has four deeply modeled examples:

- next-day / middle-mile delivery,
- workforce rostering,
- diversified portfolio selection,
- robot seam-path planning.

The talk materials directly cover these patterns, including next-day delivery optimization, nurse scheduling, portfolio optimization, and robot path planning. fileciteturn0file0L149-L177 fileciteturn0file0L209-L225 fileciteturn0file0L253-L277 fileciteturn0file0L324-L339

The wider ASL example list in the talk motivates the extensible enterprise template catalog, covering vehicle routing, flight scheduling, sports scheduling, workforce rostering, ad placement, clinical enrollment, manufacturing process optimization, forecasting, portfolio optimization, reinsurance, middle-mile network optimization, and energy unit commitment. fileciteturn0file0L363-L371

## RKO architecture

The random-key solver is intentionally problem-independent. A continuous key vector is generated, then a business-specific decoder turns the keys into a decision; the business-specific fitness function evaluates cost and feasibility. This mirrors the talk's description of problem-independent search, problem-dependent decoding, and fitness evaluation. fileciteturn0file0L747-L759

## QUBO architecture

The QUBO / Ising inspector makes the mathematical bridge explicit:

```text
x ∈ {0,1}
H(x) = xᵀQx
       ↓
x = (1-z)/2
       ↓
H(z) = Σ Jᵢⱼ zᵢzⱼ + Σ hᵢzᵢ + offset
```

The attached talk presents QUBO and Ising as the quantum-native formulation accepted by quantum annealing or hybrid QAOA workflows. fileciteturn0file0L653-L670

## Hardware boundary

No AWS credentials belong on the phone. A real Braket deployment should sit behind the server adapter. Amazon Braket currently exposes QPUs from AQT, IonQ, IQM, QuEra, and Rigetti, along with managed and local simulators. AWS also documents hybrid jobs for workloads such as QAOA. citeturn197076search0turn197076search7

## Current Expo baseline

This repository targets Expo SDK 57, which was released June 30, 2026; Expo's SDK reference lists React Native 0.86 and React 19.2 for SDK 57. citeturn591575search1turn591575search3

## Run the mobile app

```bash
npm install
npx expo start
```

For a device build:

```bash
npx expo run:ios
```

or use EAS Build after configuring your own identifiers and Apple credentials.

## iPhone QR codes

The repository includes a permanent QR code for installing Expo Go from the iOS App Store and a QR code for opening this GitHub repository. See [EXPO_IOS_QR_GUIDE.md](EXPO_IOS_QR_GUIDE.md) for the image files and for the exact steps to generate a temporary Expo Go development QR or a real EAS preview-build installation QR. An app-specific QR is intentionally not fabricated until the project is linked to an authenticated Expo account and an actual build or update exists.

## Run the optional API

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
uvicorn server.main:app --reload --port 8787
```

For local development only, set:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787
```

The mobile optimizer automatically falls back to its deterministic local engine when the server is unavailable.

For an App Store build, either omit `EXPO_PUBLIC_API_BASE_URL` to retain local-first mode or set a real HTTPS endpoint. Never embed a localhost endpoint in a production build; see [the iOS submission guide](APP_STORE_SUBMISSION.md) for the complete release checklist.

## Production hardening direction

Before treating this as a production enterprise system, add authentication, tenant isolation, persistent experiment manifests, data-source connectors, robust solver validation, exact classical baselines, real device capability checks, spend controls, and immutable audit records.

## Important claims boundary

This is a proof-of-concept application inspired by public presentation material. It does **not** represent Amazon internal software, Amazon customer data, an Amazon product, or evidence of quantum advantage. The app's quantum path is intentionally labeled and isolated so it cannot be mistaken for a QPU result.
