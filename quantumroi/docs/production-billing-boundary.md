# Production billing boundary

QuantumROI currently exposes plan and credit screens as a demo-safe UI foundation. The mobile client may present products and start a native purchase flow, but it must not be the authority for entitlements.

In production, the secure backend must verify App Store and Google Play transactions, determine the active subscription, calculate trial or grace-period state, issue usage credits, prevent replayed receipts, and write an entitlement audit trail. Client-supplied plan identifiers, credit balances, discount values, or verification flags must never be trusted as proof of purchase.

The current checkout actions intentionally show a handoff message instead of pretending that a purchase completed. A native store adapter and server verification endpoint can be connected later without changing the dashboard or optimization domain modules.
