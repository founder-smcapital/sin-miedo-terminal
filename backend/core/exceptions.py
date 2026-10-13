"""
Standardized Institutional Error Handling
Provides domain-specific exceptions and clear diagnostic contracts for upstream API failures.
"""
from typing import Optional, Dict, Any
from fastapi import HTTPException, status


class InstitutionalDataError(Exception):
    """Base exception for all market data engine errors."""
    def __init__(
        self,
        message: str,
        provider: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.status_code = status_code
        self.details = details or {}


class ProviderUnavailableError(InstitutionalDataError):
    """Raised when an external or OpenBB provider is degraded, rate-limited, or unreachable."""
    def __init__(
        self,
        message: str = "Market data provider temporarily unavailable or rate-limited",
        provider: str = "unknown",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            provider=provider,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details=details
        )


class DataParsingError(InstitutionalDataError):
    """Raised when external data payload format changes or serialization fails."""
    def __init__(
        self,
        message: str = "Failed to parse regulatory market data payload",
        provider: str = "unknown",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            provider=provider,
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details
        )


class RateLimitExceededError(InstitutionalDataError):
    """Raised when an upstream regulatory endpoint rate-limit is triggered."""
    def __init__(
        self,
        message: str = "Regulatory endpoint rate-limit reached. Backing off.",
        provider: str = "unknown",
        retry_after_seconds: int = 60
    ):
        super().__init__(
            message=message,
            provider=provider,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details={"retry_after_seconds": retry_after_seconds}
        )
