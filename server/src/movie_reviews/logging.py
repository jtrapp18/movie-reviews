import logging
import os
from logging.handlers import RotatingFileHandler

LOG_LEVEL = os.getenv("APP_LOG_LEVEL", "INFO").upper()


class ColorFormatter(logging.Formatter):
    COLORS = {
        "DEBUG": "\033[36m",  # Cyan
        "INFO": "\033[32m",  # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",  # Red
        "CRITICAL": "\033[41m",  # Red background
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        level_color = self.COLORS.get(record.levelname, "")
        prefix = f"{level_color}{record.levelname:<8}{self.RESET}"
        message = super().format(record)
        return f"{prefix} {message}"


def _build_logger() -> logging.Logger:
    logger = logging.getLogger("movie_reviews")
    if logger.handlers:
        return logger

    logger.setLevel(LOG_LEVEL)

    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "log")
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, "app.log")

    console_handler = logging.StreamHandler()
    console_handler.setLevel(LOG_LEVEL)
    console_fmt = ColorFormatter(
        "[%(asctime)s] %(name)s %(message)s", "%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(console_fmt)

    file_handler = RotatingFileHandler(
        log_path, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    file_handler.setLevel(LOG_LEVEL)
    file_fmt = logging.Formatter(
        "[%(asctime)s] %(levelname)s %(name)s %(message)s", "%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(file_fmt)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    logger.propagate = False

    return logger


logger = _build_logger()
