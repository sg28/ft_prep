import logging
import sys
from pythonjsonlogger import jsonlogger
from app.config import settings


def setup_logger(name: str) -> logging.Logger:
    """
    Setup logger with JSON formatting.
    
    Args:
        name: Logger name
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.log_level.upper()))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    
    # JSON formatter for structured logging
    formatter = jsonlogger.JsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s',
        rename_fields={'timestamp': '@timestamp', 'level': 'severity'}
    )
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger
