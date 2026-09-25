# Security and Safety Boundary

## Mobile app

The mobile app may hold:

- synthetic demo inputs,
- user-selected solver settings,
- experiment IDs,
- non-sensitive report previews.

The mobile app should not hold:

- AWS access keys,
- long-lived cloud secrets,
- privileged IAM tokens,
- private enterprise datasets without a suitable security architecture.

## API

The backend should enforce:

1. authentication,
2. tenant authorization,
3. schema validation,
4. maximum model dimensions,
5. request rate limits,
6. experiment spend limits,
7. explicit live-execution intent,
8. immutable experiment IDs,
9. audit logging,
10. result sanitation.

## Cloud

Use AWS IAM to scope the service role. Store experiment artifacts in a customer-controlled S3 bucket. Prefer short-lived credentials and assume-role patterns over static credentials.

## Data minimization

Only send the data required for the optimization model. Where possible, transform raw records into aggregate features before submission.

## Error handling

Cloud quantum jobs can fail for availability, compilation, device, or quota reasons. The client should not convert an exhausted live quantum failure into a fake “completed” result. Instead, surface an explicit job state and preserve the failed task metadata.

## Logging

Log model hash, run ID, solver version, backend, status transitions, and latency. Do not log raw sensitive business inputs by default.

## Store submission checklist

Before distributing the app:

- verify no secrets are bundled,
- verify production API origins,
- verify privacy policy and terms,
- verify data retention settings,
- verify all third-party SDK disclosures,
- verify crash/error handling does not leak request payloads.
