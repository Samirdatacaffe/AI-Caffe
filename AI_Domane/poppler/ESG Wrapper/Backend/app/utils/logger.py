"""
Structured logging setup for the entire application.

Every module imports:
    from app.utils.logger import logger

Log format:  TIMESTAMP | MODULE | LEVEL | MESSAGE
"""

import logging
import sys

_FORMAT = "%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s"
_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def _build_logger(
    name: str = "esgcaffe",
    level: int = logging.INFO,
) -> logging.Logger:
    """Create a console logger with structured formatting."""
    _logger = logging.getLogger(name)
    if not _logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(_FORMAT, datefmt=_DATE_FORMAT))
        _logger.addHandler(handler)
    _logger.setLevel(level)
    return _logger


logger = _build_logger()
