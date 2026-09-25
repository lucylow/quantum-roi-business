from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Dict


@dataclass
class Counter:
    window_started: float
    count: int


class InMemoryRateLimiter:
    """Small single-process guard for demos; use a distributed limiter in production."""

    def __init__(self, limit: int = 60, window_seconds: int = 60) -> None:
        self.limit = max(1, limit)
        self.window_seconds = max(1, window_seconds)
        self._items: Dict[str, Counter] = {}

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        counter = self._items.get(key)
        if counter is None or now - counter.window_started >= self.window_seconds:
            self._items[key] = Counter(window_started=now, count=1)
            return True
        if counter.count >= self.limit:
            return False
        counter.count += 1
        return True

    def prune(self) -> None:
        now = time.monotonic()
        self._items = {key: value for key, value in self._items.items() if now - value.window_started < self.window_seconds}
