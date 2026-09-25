from __future__ import annotations

import os
import re
from urllib.parse import urlparse

DEVICE_ARN_RE = re.compile(r"^arn:aws:braket:[a-z0-9-]+::device/(qpu|simulator)/[A-Za-z0-9._:/-]+$")


def csv_env(name: str, default: list[str]) -> list[str]:
    raw = os.getenv(name, "").strip()
    if not raw:
        return default
    return [item.strip() for item in raw.split(",") if item.strip()]


def allowed_origins() -> list[str]:
    return csv_env("ALLOWED_ORIGINS", ["http://localhost:8081", "http://localhost:19006", "http://127.0.0.1:8081"])


def safe_device_arn(value: str) -> bool:
    return bool(DEVICE_ARN_RE.fullmatch(value.strip()))


def public_https_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


def live_braket_enabled() -> bool:
    return os.getenv("LIVE_BRAKET_ENABLED", "false").strip().lower() == "true"


def max_request_bytes() -> int:
    raw = os.getenv("MAX_REQUEST_BYTES", "1048576")
    try:
        return max(16_384, min(int(raw), 10_485_760))
    except ValueError:
        return 1_048_576
