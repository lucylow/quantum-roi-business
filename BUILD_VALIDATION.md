# Quantum ROI Business v2 — Build Validation

**Validation date:** 2026-09-25
**Repository:** `lucylow/quantum-roi-business`
**Scope:** Integrated Decision Lab v2 mobile proof of concept and its optional FastAPI optimization boundary.

## Completed checks

| Check | Result | Notes |
|---|---|---|
| TypeScript type check | **PASS** | `npm run typecheck` completed with `tsc --noEmit`. |
| Unit tests | **PASS** | `npm test` completed: 1 suite and 7 tests passed. |
| ESLint | **PASS with warnings** | `npm run lint` completed without errors; 28 non-blocking style and unused-code warnings remain. |
| Expo web export | **PASS** | `npx expo export --platform web` generated the production web bundle. |
| Python compilation | **PASS** | `python -m compileall -q server` completed in an isolated virtual environment. |
| FastAPI import and request-path smoke test | **PASS** | `/health` and the generic optimization path were validated with a deterministic payload. |
| Reproducible dependency install | **PASS** | `npm ci` completed using the committed `package-lock.json`. |

## Included product scope

The mobile app contains four business-first optimization demonstrations: next-day/middle-mile delivery, workforce rostering, diversified portfolio selection, and robot seam-path planning. Each follows a traceable workflow from business scenario and constraints to classical baseline, deterministic optimization, QUBO/Ising inspection, quantum-readiness assessment, modeled impact, and reproducibility record.

The optional FastAPI service exposes health, QUBO-model, optimization, and guarded Braket submission routes. Live Braket execution remains non-submitting by default and requires server-side AWS credentials, storage, compatible device configuration, solver-specific compilation, authentication, queue/polling, and spend controls.

## Known non-blocking items

The lint step reports 28 warnings, chiefly `Array<T>` style preferences, unused symbols, and duplicate imports. These do not cause a build or test failure and can be addressed as code-cleanup work.

## Claims boundary

This is a research/product proof of concept inspired by public presentation material. It is not Amazon software, does not contain Amazon customer data, does not claim Amazon endorsement, and does not claim evidence of quantum advantage.
