"""
Macro & Yield Curve Data Models
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class YieldTenorPoint(BaseModel):
    tenor: str = Field(..., description="Tenor maturity (e.g., '3M', '2Y', '10Y', '30Y')")
    yield_percent: float = Field(..., description="Annualized yield in percentage (e.g. 4.28)")
    date: str = Field(..., description="Reported date (YYYY-MM-DD)")
    change_1d_bps: Optional[float] = Field(None, description="1-day change in basis points")
    change_1m_bps: Optional[float] = Field(None, description="1-month change in basis points")

class SpreadAnalysis(BaseModel):
    spread_name: str = Field(..., description="Spread name (e.g., '10Y-2Y', '10Y-3M')")
    spread_bps: float = Field(..., description="Yield spread in basis points (1 bp = 0.01%)")
    is_inverted: bool = Field(..., description="True if spread is negative (< 0 bps)")
    historical_percentile_24m: Optional[float] = Field(None, description="Percentile ranking over last 24 months")
    status: str = Field(..., description="INVERTED, FLAT, NORMAL, or STEEPENING")

class InversionEvent(BaseModel):
    spread: str = Field(..., description="Spread evaluated ('10Y-2Y' or '10Y-3M')")
    start_date: str = Field(..., description="Date inversion began")
    end_date: Optional[str] = Field(None, description="Date inversion resolved or None if ongoing")
    status: str = Field(..., description="RESOLVED or ONGOING")
    duration_days: int = Field(..., description="Total calendar days inverted")
    trough_bps: float = Field(..., description="Deepest inversion level in basis points")

class YieldCurveHistoryPoint(BaseModel):
    date: str
    yield_3m: Optional[float] = None
    yield_2y: Optional[float] = None
    yield_10y: Optional[float] = None
    yield_30y: Optional[float] = None
    spread_10y_2y_bps: Optional[float] = None
    spread_10y_3m_bps: Optional[float] = None

class YieldCurvePayload(BaseModel):
    tenors: Dict[str, YieldTenorPoint] = Field(..., description="Current yields across benchmark tenors")
    spreads: Dict[str, SpreadAnalysis] = Field(..., description="Yield curve slope spreads")
    inversions_history: List[InversionEvent] = Field(default_factory=list, description="Yield curve inversion episodes over 24 months")
    history_points: List[YieldCurveHistoryPoint] = Field(default_factory=list, description="Historical curve points for charting")
    macro_regime_note: str = Field(..., description="Quant desk assessment of curve regime")
