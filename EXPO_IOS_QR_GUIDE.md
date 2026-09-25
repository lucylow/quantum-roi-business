# Expo iOS QR Guide

This package contains three permanent QR codes in [`qr/`](qr/):

| File | Scan result | Use |
|---|---|---|
| `IOS_EXPO_GO_APP_STORE_QR.png` | Opens [Expo Go in the iOS App Store](https://apps.apple.com/us/app/expo-go/id982107779) | Install Expo Go on an iPhone or iPad. |
| `GITHUB_REPOSITORY_QR.png` | Opens [the GitHub repository](https://github.com/lucylow/quantum-roi-business) | View, clone, or publish the source repository. |
| `MOBILE_REDESIGN_REFERENCE_QR.png` | Opens [the mobile redesign reference](https://github.com/lucylow/Quantum-ROI-MobileMockupRedesign) | Review the original visual mockup source that informed this React Native implementation. |

## Important distinction: Expo Go QR vs. installed-app QR

An **app-specific Expo QR** cannot be generated from source files alone. It is issued by an active Expo development server, an EAS Update, or an EAS build page. This project has no linked EAS project and the available environment is not authenticated to Expo, so the archive deliberately does not include a fake or stale app-launch QR.

For **App Store delivery**, Expo Go is only a development/testing tool. The production path is a signed iOS archive followed by TestFlight/App Store Connect submission, as described in [`APP_STORE_SUBMISSION.md`](APP_STORE_SUBMISSION.md).

## Create a temporary Expo Go QR for local iPhone testing

1. Scan `IOS_EXPO_GO_APP_STORE_QR.png` and install **Expo Go** on the iPhone.
2. On the development machine, install dependencies and start the development server:

   ```bash
   npm ci
   npx expo start --tunnel
   ```

3. Scan the QR displayed by the Expo CLI using the Expo Go app.

The `--tunnel` QR is temporary and works only while the development server is running. It is not an App Store build and should not be distributed as a production link.

## Create a distributable iOS QR after linking Expo/EAS

Use an authenticated Expo account and an Apple Developer account. Before building, set the real public legal URLs required by the production gate:

```bash
export EXPO_PUBLIC_PRIVACY_POLICY_URL="https://YOUR-REAL-DOMAIN/privacy"
export EXPO_PUBLIC_SUPPORT_URL="https://YOUR-REAL-DOMAIN/support"
# Optional: omit this line to retain the local-first app mode.
export EXPO_PUBLIC_API_BASE_URL="https://YOUR-REAL-API"
```

Then run:

```bash
npx eas-cli@^16.20.0 login
npx eas-cli@^16.20.0 build:configure
npm run validate:store
npm run build:ios:preview
```

EAS will present the build page and its real installation QR when the preview build is ready. Internal iOS distribution may require registered test devices, depending on the signing method. To prepare the App Store version, use:

```bash
npm run build:ios:production
npm run submit:ios
```

The production path uses TestFlight/App Store Connect rather than an Expo Go QR. Complete the metadata and App Privacy steps in [`APP_STORE_SUBMISSION.md`](APP_STORE_SUBMISSION.md) before submitting.

## Regenerate the permanent package QR assets

The QR source URLs are stored next to each PNG as `.txt` files. To regenerate matching images, install the lightweight Python dependency and run:

```bash
python3 -m pip install 'qrcode[pil]>=8.0,<9.0'
python3 scripts/generate-qr-assets.py
```
