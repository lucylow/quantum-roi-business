from __future__ import annotations

from typing import Any


MAX_STRING = 5_000
MAX_LIST = 2_000


def validate_json_depth(value: Any, max_depth: int = 12, depth: int = 0) -> list[str]:
    if depth > max_depth:
        return [f"JSON nesting exceeds the {max_depth}-level limit."]
    if isinstance(value, dict):
        if len(value) > MAX_LIST:
            return [f"Object contains more than {MAX_LIST} keys."]
        issues: list[str] = []
        for key, child in value.items():
            if not isinstance(key, str) or len(key) > 500:
                issues.append("JSON object key is too long.")
            issues.extend(validate_json_depth(child, max_depth, depth + 1))
        return issues
    if isinstance(value, list):
        if len(value) > MAX_LIST:
            return [f"Array contains more than {MAX_LIST} items."]
        issues: list[str] = []
        for child in value:
            issues.extend(validate_json_depth(child, max_depth, depth + 1))
        return issues
    if isinstance(value, str) and len(value) > MAX_STRING:
        return [f"String exceeds the {MAX_STRING}-character limit."]
    return []


def sanitize_run_id(value: str) -> str:
    return value.strip()[:120]
