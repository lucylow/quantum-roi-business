from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict

from server.security import live_braket_enabled, safe_device_arn


@dataclass(frozen=True)
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
        s3_prefix=os.getenv("BRAKET_S3_PREFIX", "quantum-roi/").strip("/") + "/",
    )


def validate_config(config: BraketConfig) -> list[str]:
    issues: list[str] = []
    if not config.device_arn:
        issues.append("BRAKET_DEVICE_ARN is not configured.")
    elif not safe_device_arn(config.device_arn):
        issues.append("BRAKET_DEVICE_ARN is not a valid Braket device ARN.")
    if not config.s3_bucket:
        issues.append("BRAKET_S3_BUCKET is not configured.")
    if not config.region:
        issues.append("AWS_REGION is not configured.")
    return issues


def submit_qubo_job(qubo: Dict[str, Any], run_id: str, shots: int, device_arn: str | None = None) -> Dict[str, Any]:
    config = config_from_env()
    target = (device_arn or config.device_arn).strip()
    issues = validate_config(config)
    if not target:
        issues.append("No target device ARN supplied.")
    elif not safe_device_arn(target):
        issues.append("Target device ARN is invalid.")
    if not live_braket_enabled():
        issues.append("LIVE_BRAKET_ENABLED is false.")

    if issues:
        return {
            "status": "blocked",
            "taskId": f"blocked-{run_id}",
            "message": "Live Braket execution is blocked by server policy or incomplete configuration.",
            "issues": issues,
        }

    try:
        from braket.aws import AwsQuantumTask  # type: ignore
        _ = AwsQuantumTask
    except ImportError:
        return {
            "status": "blocked",
            "taskId": f"no-sdk-{run_id}",
            "message": "Amazon Braket SDK is not installed in this server runtime.",
            "issues": ["Install the server requirements before enabling live tasks."],
        }

    # The quantum program compiler is intentionally a separate implementation
    # boundary. This prevents the API from claiming that a generic QUBO dict has
    # already been compiled into a device-valid program.
    _ = qubo
    _ = shots
    return {
        "status": "blocked",
        "taskId": f"compiler-required-{run_id}",
        "message": "Braket SDK is available, but this release keeps live submission blocked until a solver-specific program compiler and device compatibility test are installed.",
        "deviceArn": target,
    }
