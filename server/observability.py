from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger("quantum_roi")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


def log_event(event: str, request_id: str, **fields: Any) -> None:
    safe = {key: str(value)[:300] for key, value in fields.items() if key.lower() not in {"secret", "token", "password", "authorization"}}
    logger.info("event=%s request_id=%s fields=%s", event, request_id[:80], safe)
