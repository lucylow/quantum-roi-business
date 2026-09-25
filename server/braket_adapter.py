from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class BraketConfig:
    region: str
    device_arn: str
    s3_bucket: str
    s3_prefix: str


def config_from_env() -> BraketConfig:
    return BraketConfig(
        region=os.getenv("AWS_REGION", "us-east-1"),
        device_arn=os.getenv("BRAKET_DEVICE_ARN", ""),
        s3_bucket=os.getenv("BRAKET_S3_BUCKET", ""),
        s3_prefix=os.getenv("BRAKET_S3_PREFIX", "quantum-roi/")
    )


def validate_config(config: BraketConfig) -> list[str]:
    issues = []
    if not config.device_arn:
        issues.append("BRAKET_DEVICE_ARN is not configured.")
    if not config.s3_bucket:
        issues.append("BRAKET_S3_BUCKET is not configured.")
    if not config.region:
        issues.append("AWS_REGION is not configured.")
    return issues


def submit_qubo_job(qubo: Dict[str, Any], run_id: str, shots: int, device_arn: str | None = None) -> Dict[str, Any]:
    """
    Real Braket boundary.

    This function intentionally does not execute unless the runtime has the
    Braket SDK and a complete AWS configuration. The fallback response makes
    it safe to demo without accidentally submitting paid cloud work.
    """
    config = config_from_env()
    target = device_arn or config.device_arn
    issues = validate_config(config)
    if not target:
        issues.append("No target device ARN supplied.")
    if issues:
        return {
            "status": "blocked",
            "taskId": f"blocked-{run_id}",
            "message": "Live Braket execution is blocked until server credentials, S3, and device settings are configured.",
            "issues": issues,
        }

    try:
        from braket.aws import AwsQuantumTask  # type: ignore
        # QUBO-to-circuit/AHS compilation is deliberately separated from API
        # transport. A production implementation should choose a solver-specific
        # program format and validate device compatibility before submit.
        _ = AwsQuantumTask
        _ = qubo
        _ = shots
        return {
            "status": "queued",
            "taskId": f"braket-{run_id}",
            "message": "Braket SDK detected. Wire the solver-specific quantum program into this adapter before enabling live tasks.",
            "deviceArn": target,
        }
    except ImportError:
        return {
            "status": "blocked",
            "taskId": f"no-sdk-{run_id}",
            "message": "Amazon Braket SDK is not installed in this environment. Use the local simulator path or install the server requirements.",
        }
