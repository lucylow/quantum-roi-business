# Amazon Braket Integration Guide

## Purpose

The app is intentionally architected so that a Braket experiment can be connected without putting AWS credentials on the phone.

Amazon Braket provides access to QPUs and simulators and supports hybrid quantum-classical algorithms. The service describes a quantum task as the atomic request to a device, and results can be stored in S3. citeturn197076search5turn197076search7

## Environment

```bash
cp .env.example .env
```

Set:

```text
AWS_REGION=us-east-1
BRAKET_DEVICE_ARN=<compatible-device-arn>
BRAKET_S3_BUCKET=<customer-controlled-bucket>
BRAKET_S3_PREFIX=quantum-roi/
```

The current Braket device page can be used to discover compatible QPUs and simulator regions. citeturn197076search0

## IAM principle

Use a dedicated runtime role with the narrowest permissions required for:

- creating quantum tasks or hybrid jobs,
- writing task outputs to the designated S3 prefix,
- reading the status/results needed by the application,
- emitting operational logs.

Do not ship an AWS access key in an Expo application. The mobile client should authenticate to the application backend, and the backend assumes the appropriate AWS execution role.

## Recommended production flow

```text
Mobile app
   │
   │ POST /v1/braket/submit
   ▼
API gateway / app server
   │
   ├── validate tenant + experiment
   ├── validate QUBO dimensions
   ├── validate device compatibility
   ├── write experiment manifest
   │
   ▼
Job queue
   │
   ▼
Braket worker
   │
   ├── choose simulator / QPU
   ├── compile / embed
   ├── submit quantum task
   └── poll / persist results
   │
   ▼
S3 + database
   │
   ▼
Mobile result record
```

## Quantum tasks vs hybrid jobs

Use a direct quantum task when the program is already compiled for the target device and the workload is simple. Use a hybrid job when a classical optimizer and quantum device must interact repeatedly, such as QAOA-style parameter optimization. AWS documents Braket Hybrid Jobs specifically for these hybrid workflows. citeturn197076search7

## QAOA

The application marks small models as `qaoaEligible`, but this flag means “technically worth exploring,” not “guaranteed to outperform a classical solver.” AWS documents a QAOA example for Max Cut using PennyLane and Braket. citeturn197076search8

## Next implementation step

Replace `submit_qubo_job()` with a solver-specific compilation module. The adapter should accept a normalized experiment manifest rather than arbitrary client-provided AWS settings. The server then owns device compatibility, quotas, logging, retries, and result persistence.
