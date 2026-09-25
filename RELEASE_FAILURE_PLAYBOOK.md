# iOS Release Failure Playbook

## 1. “Failed to read eas.json”

Ensure `eas.json` exists at the repository root and is valid JSON. Run:

```bash
node scripts/validate-release.mjs
```

The current file is intentionally minimal and contains only production-safe profiles.

## 2. Duplicate build number

Do not manually reuse an App Store build number. The project uses:

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": { "production": { "autoIncrement": true } }
}
```

This lets EAS manage the developer-facing build number.

## 3. Production build points to localhost

This is deliberately treated as a configuration error. Set an HTTPS remote API endpoint or leave it unset and use local-first mode.

## 4. TypeScript / dependency mismatch

Run:

```bash
npm ci
npx expo-doctor
npx expo install --fix
npm run typecheck
```

The current dependency matrix is pinned to Expo SDK 57, React Native 0.86, and React 19.2.3, which Expo documents as a supported SDK 57 combination. citeturn928956search0

## 5. App Store privacy metadata

App Store Connect requires a privacy-policy URL and accurate App Privacy responses. The application does not use analytics or advertising SDKs in this release, but the answers must still reflect any server-side data handling you actually enable. citeturn259090search3turn259090search11

## 6. Privacy manifest warnings

Inspect the generated iOS project after `npx expo prebuild --clean --platform ios`. Apple treats required-reason APIs as a submission requirement and the final bundled third-party SDKs are part of your responsibility. citeturn259090search0

## 7. Export compliance questionnaire

The config declares exempt-only encryption. If you add non-exempt cryptography, change the declaration and provide the documentation/code Apple requires. citeturn767364search0turn767364search2

## 8. Crashes while running a scenario

The UI now validates the optimization input before starting, uses bounded solver budgets, catches async failures, and places the entire application under a React error boundary.

## 9. Network hangs

Remote calls have bounded response size, request timeout, a small retry budget, and a local deterministic fallback. A remote failure should not strand the user on an infinite spinner.

## 10. Quantum experiment incorrectly reports “queued”

The client now sends Braket requests through the server boundary. The server defaults live execution to disabled and the current adapter returns a blocked state until a solver-specific program compiler and production device policy are installed.
