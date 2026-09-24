# QuantumROI Mobile Interface Design

## Product direction

QuantumROI is designed as a premium business analytics tool for small and medium businesses. The mobile experience should feel closer to a calm fintech dashboard than a physics laboratory: clear outcomes first, technical evidence available through progressive disclosure, and explicit labels whenever a result is simulated rather than measured on quantum hardware.

The app assumes portrait orientation and one-handed use. Primary actions sit in the lower half of the screen, touch targets are at least 44 points, and dense technical information is placed behind expandable cards or secondary screens.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Welcome / Onboarding | Plain-language positioning, demo mode entry, and a short explanation of classical, quantum-inspired, and simulated quantum methods. |
| Home dashboard | Greeting, workspace context, optimize CTA, quick-start use cases, savings summary, usage meter, and recent experiments. |
| Use-case picker | Delivery routes as the launch use case, with scheduling, allocation, and custom problem cards marked as upcoming or available. |
| Delivery setup | Vehicle count, depot, destination count, route constraints, cost assumptions, and natural-language goal input. |
| Data import / manual locations | Demo dataset, CSV/JSON import entry point, or manual location rows with validation feedback. |
| Map preview | Route/depot visualization placeholder or map abstraction, with a clear demo/simulation label until a map provider is configured. |
| Interpretation review | Structured problem summary, assumptions, missing information, confidence level, and confirm/edit actions. |
| Optimization progress | Real stage labels such as validating, building model, running baseline, running inspired method, simulating quantum workflow, and comparing results. |
| Results summary | Best method, distance/time/cost, improvement versus baseline, estimated savings, feasibility, and evidence badge. |
| Method comparison | Classical, quantum-inspired, and quantum simulation cards with runtime, score, feasibility, and simulation/hardware distinction. |
| ROI analysis | Estimated monthly/annual savings, assumptions, sensitivity notes, and estimated versus confirmed impact distinction. |
| Experiment history | Flat list of saved experiments with status, method, improvement, date, and savings. |
| Experiment detail | Full result, assumptions, advanced technical details, and rerun action. |
| Report preview / share | Professional report outline and native share/export entry point. |
| Pricing / credits | Free, Pro, Business, and usage-credit concepts with safe checkout handoff placeholders. |
| Settings / privacy / help | Preferences, security and privacy copy, FAQ, support, and offline state. |
| Error / empty / maintenance | Recoverable states with clear next actions and no false execution claims. |

## Key user flows

### First demo experiment

User opens the app, reads the positioning, and taps **Try a delivery demo**. The dashboard opens with a populated demo experiment. The user reviews the route problem, confirms the assumptions, taps **Run comparison**, watches the named optimization stages, and reaches a results screen where each method is labeled. The user can save the experiment and open a report preview.

### Custom route setup

User taps **Optimize a problem**, chooses **Delivery routes**, enters a vehicle count and delivery count, adds a business goal, reviews the interpreted model, and confirms execution. Missing information is presented as an explicit assumption choice rather than silently invented.

### Technical inspection

From results, the user opens **Advanced details** to see the algorithm, provider mode, simulation badge, seed, runtime, input size, constraint violations, and reproducibility notes. The app never calls a simulation a hardware result.

## Color choices

The brand uses a dark graphite canvas with a restrained electric-cyan accent and warm ROI green. This signals precision and premium technology without relying on neon quantum clichés.

| Token | Color | Usage |
|---|---|---|
| Graphite background | `#0B1118` | Main screen canvas and status surfaces |
| Slate surface | `#111C27` | Cards and elevated panels |
| Elevated slate | `#172535` | Inputs, selected cards, and secondary panels |
| Ice text | `#F4F8FB` | Primary headings and metrics |
| Muted blue-gray | `#91A4B6` | Supporting copy and metadata |
| Signal cyan | `#52D6E8` | Primary CTA, active navigation, quantum simulation accents |
| ROI green | `#7BE0A2` | Savings, feasibility, and positive deltas |
| Amber | `#F4C66D` | Assumptions, warnings, and confidence notices |
| Coral | `#FF7D7D` | Errors and failed runs |

## Component language

Use rounded cards with modest radii, thin borders, high-contrast text, and short labels. Primary buttons use filled cyan with press feedback; secondary actions use outlined slate buttons. Badges such as `SIMULATION`, `ESTIMATED`, and `DEMO MODE` remain visible in result cards. Charts should be compact and legible, using bars or simple comparison rows rather than decorative 3D graphics.

## Accessibility and interaction

Every icon-only action has an accessible label. Dynamic text must remain readable at larger sizes, contrast must meet mainstream iOS expectations, and loading feedback must name the current stage. Reduced-motion settings should avoid decorative animation. Haptics are reserved for primary actions and completion feedback.
