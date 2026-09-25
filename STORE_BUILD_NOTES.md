# Store Build Notes

The release code is intentionally conservative around App Store submission. Apple requires a public privacy-policy URL for an iOS app, and App Store Connect requires accurate privacy/data-use declarations. Those values depend on the actual legal/business setup and therefore remain environment/console inputs instead of fake placeholders. citeturn259090search3

Before the final production build:

```bash
export APP_ENV=production
export EXPO_PUBLIC_PRIVACY_POLICY_URL="https://YOUR-REAL-DOMAIN/privacy"
export EXPO_PUBLIC_SUPPORT_URL="https://YOUR-REAL-DOMAIN/support"
# Optional:
export EXPO_PUBLIC_API_BASE_URL="https://YOUR-REAL-API"

npm run validate
npm run validate:store
npm test
npm run typecheck
npx expo-doctor
```

Then:

```bash
eas build --platform ios --profile production
```

Expo's current documentation describes the production iOS EAS build and EAS submission commands shown above. citeturn928956search5

Apple's required-reason API rules mean you should inspect the final generated/bundled privacy manifests after native dependencies are installed, rather than assuming a source-level manifest is sufficient. citeturn259090search0turn259090search1

The project uses platform HTTPS/TLS and declares exempt-only encryption. Apple documents `ITSAppUsesNonExemptEncryption` as the field used to streamline export-compliance handling when the application uses no non-exempt encryption. Reassess this declaration if a proprietary encryption implementation is added. citeturn767364search0
