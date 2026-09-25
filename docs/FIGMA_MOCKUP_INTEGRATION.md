# Figma Mockup Integration Handoff

## Purpose

This release integrates the mobile mockup direction into the React Native application as a presentation layer over the existing optimization engines.

## Source of truth

The original visual mockup repository is [lucylow/Quantum-ROI-MobileMockupRedesign](https://github.com/lucylow/Quantum-ROI-MobileMockupRedesign). Its local reference image is included at:

`design-reference/quantum-roi-mobile-redesign-reference.png`

The implementation deliberately translates the visual language into React Native primitives rather than rasterizing the UI. This keeps all important text, controls, charts, and states accessible and interactive.

## Screen mapping

| Mockup area | React Native implementation |
|---|---|
| Executive Command Center | `OverviewScreen.tsx` |
| Optimization Use Cases | `CasesScreen.tsx` |
| Optimization Workbench | `WorkbenchScreen.tsx` |
| Quantum Readiness Lab | `QuantumLabScreen.tsx` |
| Scenario Laboratory | `ScenarioLabScreen.tsx` |
| Business Impact | `ImpactScreen.tsx` |
| Experiments & Runs | `RunsScreen.tsx` |
| Settings / Profile | `SettingsRedesignScreen.tsx` |
| Shared desktop/mobile components | `components/enterprise.tsx`, `components/advanced.tsx`, `components/ui.tsx` |
| Enterprise synthetic dataset | `data/mockEnterprise.ts`, `data/mockAnalytics.ts` |

## Design rules carried into code

1. Business problem comes before quantum hardware.
2. Baselines remain visible beside optimized values.
3. Classical benchmark results are not hidden behind technical screens.
4. Quantum states are labeled simulated, prepared, or not submitted unless a real service result exists.
5. Financial values are explicitly modeled and synthetic.
6. Error, loading, offline, empty, and review states are first-class UI states.
7. Responsive behavior changes information density instead of simply shrinking desktop layouts.
8. The product is independent and does not use Amazon or AWS logos or proprietary brand artwork.

## Interaction architecture

```text
App.tsx
  |
  +-- AppProvider
  |
  +-- Responsive Shell
  |      +-- Desktop navigation
  |      +-- Mobile bottom navigation
  |
  +-- Redesign screens
         +-- Overview
         +-- Cases
         +-- Workbench
         +-- Impact
         +-- Scenarios
         +-- Quantum
         +-- Runs
         +-- Settings
                 |
                 +-- Existing optimization core
                 +-- Existing API/fallback service
                 +-- Existing QUBO + readiness analysis
```

## Mock data contract

The redesign data is deterministic. Values can be replaced later by API responses without changing the screen component contracts. All dashboard records are synthetic demonstration data.

## QA checklist

- [x] 390x844 iPhone layout reviewed through an Expo web preview.
- [ ] 430x932 iPhone layout reviewed.
- [ ] Tablet breakpoint reviewed.
- [ ] Dynamic type / accessibility pass reviewed.
- [ ] No raw exception text shown to users.
- [ ] No localhost production endpoint.
- [ ] No real credentials bundled in the mobile app.
- [ ] QPU execution remains behind an explicit server-side gate.
- [ ] App Store metadata URLs configured.
