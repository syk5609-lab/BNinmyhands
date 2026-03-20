import json
import logging
from datetime import datetime


def _default_serializer(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def log_event(logger: logging.Logger, event: str, **fields) -> None:
    payload = {"event": event, **fields}
    logger.info(json.dumps(payload, sort_keys=True, default=_default_serializer))
