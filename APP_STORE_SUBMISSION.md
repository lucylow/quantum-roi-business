# Quantum ROI — iOS App Store Submission Guide

## Release safeguards in this repository

The iOS release uses a dynamic Expo configuration, App Store distribution in EAS, remote developer-facing build-number management, automatic production increments, a stable bundle identifier, an iOS 16.4 minimum deployment target, explicit exempt-encryption configuration, and an Expo-generated privacy manifest. The project also includes a 1024×1024 opaque app icon, a reproducible npm lockfile, Expo Doctor validation, native iOS prebuild validation, and release scripts that use a compatible EAS CLI through `npx` rather than a locally installed legacy CLI.

The mobile app is safe to review offline. It has deterministic local optimization fallbacks, validates remote configuration before using it, uses bounded network requests, avoids bundling AWS credentials, and keeps live Braket work blocked until a separately configured server-side compiler, IAM policy, S3 policy, device policy, and spending controls exist.

## Required values before a production archive

Apple requires a public privacy-policy URL and accurate App Privacy disclosures for the app and all third-party code. Enter real, publicly reachable values owned by the product before you build:

```bash
export EXPO_PUBLIC_PRIVACY_POLICY_URL="https://YOUR-REAL-DOMAIN/privacy"
export EXPO_PUBLIC_SUPPORT_URL="https://YOUR-REAL-DOMAIN/support"
# Optional: omit this variable to keep the app in local-first mode.
export EXPO_PUBLIC_API_BASE_URL="https://YOUR-REAL-API"
```

Do **not** provide a localhost URL in a production build. The release gate refuses non-HTTPS URLs, placeholders, and absent privacy/support URLs. `APP_ENV` is set to `production` by the EAS production profile; `EXPO_PUBLIC_APP_ENV=production` can be used when reproducing the production configuration locally.

## Reproducible release sequence

Run these checks from the repository root before building:

```bash
npm ci
npm run typecheck
npm run validate
npm test
npx expo-doctor
npm run prebuild:ios
npm run validate:store
```

The first five commands are expected to pass without warnings or errors. The prebuild step generates the `ios/` directory for inspection; it is intentionally ignored by git. Check the generated `Info.plist` and `PrivacyInfo.xcprivacy` again if native dependencies change.

Once the legal URLs have been configured and the checks pass, create and submit the production archive from an authenticated Expo and Apple Developer account:

```bash
npm run build:ios:production
npm run submit:ios
```

The EAS production profile uses `store` distribution, `appVersionSource: remote`, and `autoIncrement: true`. If this bundle identifier already has builds in App Store Connect, initialize or synchronize the remote build version with `eas build:version:set` before the first EAS production build, using the latest App Store build number. Expo recommends remote developer-facing version management to avoid duplicate build-number rejections.[^expo-versioning]

## App Store Connect checklist

The build command does not complete the App Store listing. In App Store Connect, provide the real privacy-policy URL, accurate App Privacy answers for the mobile app and any enabled server-side data handling, app name/subtitle/description, screenshots for supported device families, support URL, age rating, pricing/availability, and App Review notes. The App Privacy responses must be maintained when the product’s collection or sharing practices change.[^apple-privacy]

Suggested App Review note: the core optimization workflow is usable without a remote backend; the app labels mock quantum paths and does not claim measured quantum advantage. If a remote API is enabled, explain what data is transmitted and ensure the App Privacy answers match that behavior.

## Export compliance and privacy manifest

The Expo config declares `usesNonExemptEncryption: false` because the app relies on platform HTTPS/TLS and does not include proprietary cryptography. Reassess this declaration before submission if proprietary cryptography or another non-exempt encryption capability is added. The generated privacy manifest declares no tracking, no collected-data categories, and no required-reason API entries for this release. Re-run prebuild and inspect the generated manifest whenever the Expo SDK or native dependencies change; third-party SDK behavior remains the publisher’s responsibility.[^expo-config]

## Explicitly not completed here

This repository does **not** claim that an `.ipa` was signed, uploaded to App Store Connect, processed by Apple, or approved for sale. Those steps require the account holder’s Apple credentials, certificates/provisioning access, legal URLs, App Store Connect metadata, and final review decisions.

[^expo-versioning]: [Expo: App version management](https://docs.expo.dev/build-reference/app-versions/)
[^expo-config]: [Expo: App configuration](https://docs.expo.dev/versions/latest/config/app/)
[^apple-privacy]: [Apple: Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/)
