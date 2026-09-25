# Quantum ROI Business — iOS Release Validation

**Validation date:** 2026-09-25
**Release version:** 2.0.1
**Scope:** Expo SDK 57 managed iOS project, optional FastAPI boundary, and App Store submission safeguards.

## Completed validation

| Check | Result | Evidence |
|---|---|---|
| Reproducible JavaScript install | **PASS** | `npm ci` completed from the committed `package-lock.json`. |
| TypeScript | **PASS** | `npm run typecheck` completed with `tsc --noEmit`. |
| Static release checks | **PASS** | `npm run validate` completed with no errors or warnings. |
| Unit tests | **PASS** | `npm test` completed: 7 Jest core tests and 5 Node release tests passed. |
| Expo dependency health | **PASS** | `npx expo-doctor` reported 21/21 checks passed. |
| iOS prebuild | **PASS** | `npx expo prebuild --clean --platform ios --no-install` generated the native iOS project without warnings. |
| Generated iOS metadata | **PASS** | Generated `Info.plist` contains the display name and export-compliance declaration; generated privacy manifest disables tracking and declares no collected or required-reason API categories; `Podfile.properties.json` sets iOS 16.4. |
| Python compilation | **PASS** | `python -m compileall -q server` completed in an isolated virtual environment. |
| Python server tests | **PASS** | 6 tests covering rate limiting and Braket/device policy passed. |
| API smoke test | **PASS** | The health endpoint contract and deterministic generic optimization path were imported and exercised. |
| Store URL gate | **PASS (fails closed)** | `npm run validate:store` correctly rejects a production build when no real privacy-policy and support URLs are supplied. |

## Release hardening included

The project uses a dynamic Expo app configuration with a stable bundle identifier (`com.lucylow.quantumroi`), iOS 16.4 minimum deployment target, App Store distribution profile, remote EAS build-number management, automatic production increments, explicit exempt-encryption declaration, generated privacy-manifest configuration, a 1024×1024 opaque app icon, and a locked dependency install.

The app defaults to a local-first optimization workflow. It allows an optional remote API only when the configured endpoint meets the build security policy, uses bounded request timeouts and retries, limits response sizes, validates inputs and QUBO/result shapes, falls back deterministically when remote service is unavailable, and isolates cloud quantum execution from the mobile bundle. A top-level React error boundary protects against render-time crashes. The settings screen also exposes configured privacy and support links without allowing link failures to disrupt the app.

## Submission prerequisites that remain user-owned

No `.ipa` was signed, uploaded, or submitted in this environment. Before creating a production archive, set real public URLs; do not replace these with placeholders:

```bash
export EXPO_PUBLIC_PRIVACY_POLICY_URL="https://YOUR-REAL-DOMAIN/privacy"
export EXPO_PUBLIC_SUPPORT_URL="https://YOUR-REAL-DOMAIN/support"
# Optional; omit to retain local-first operation:
export EXPO_PUBLIC_API_BASE_URL="https://YOUR-REAL-API"
```

Then run `npm run validate:store`, `npm run build:ios:production`, and `npm run submit:ios` from an authenticated Expo/Apple environment. App Store Connect metadata, App Privacy answers, screenshots, pricing, age rating, and final App Review submission remain manual account actions and must accurately reflect the live product and any enabled server-side data handling.
