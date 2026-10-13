"""
Standard API Response Contract & Metadata Models
"""
from typing import Generic, TypeVar, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field

T = TypeVar("T")

class DiagnosticMeta(BaseModel):
    """Metadata detailing data origin, latency, and regulatory provider health."""
    provider: str = Field(..., description="Active data provider (e.g., OpenBB FRED, SEC EDGAR Direct, CFTC)")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    cached: bool = Field(default=False, description="Whether payload was served from high-speed TTL memory")
    latency_ms: float = Field(..., description="Query execution latency in milliseconds")
    fallback_used: bool = Field(default=False, description="True if primary OpenBB provider fell back to native regulatory HTTP")
    details: Optional[Dict[str, Any]] = None

class APIResponse(BaseModel, Generic[T]):
    """Unified institutional response envelope."""
    success: bool = True
    data: T
    meta: DiagnosticMeta
