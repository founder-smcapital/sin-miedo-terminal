"""
Equity Regulatory Data Models
Covers SEC EDGAR Form 4 / 13F Institutional Holdings and FINRA Short Volume / Dark Pool flows.
"""
from typing import List, Optional
from pydantic import BaseModel, Field

# --- SEC EDGAR & INSIDER / 13F MODELS ---

class Form4InsiderRecord(BaseModel):
    filing_date: str = Field(..., description="Date SEC Form 4 was published")
    transaction_date: str = Field(..., description="Date transaction was executed")
    reporting_owner: str = Field(..., description="Name of corporate insider or director")
    relationship: str = Field(..., description="Title/relationship (e.g. CEO, Director, 10% Owner)")
    transaction_type: str = Field(..., description="BUY, SELL, OPTION_EXERCISE, or GRANT")
    transaction_code: str = Field(..., description="SEC Form 4 Code (P, S, M, A, etc.)")
    shares: float = Field(..., description="Number of shares traded")
    share_price: Optional[float] = Field(None, description="Execution price per share in USD")
    total_value_usd: Optional[float] = Field(None, description="Notional value in USD")
    shares_owned_following: Optional[float] = Field(None, description="Total shares owned post-transaction")
    is_direct: bool = Field(default=True, description="Direct vs indirect ownership")

class InstitutionalHolder13F(BaseModel):
    investor_name: str = Field(..., description="Institutional asset manager or hedge fund")
    shares_held: int = Field(..., description="Total shares reported on latest Form 13F")
    market_value_usd: float = Field(..., description="Position value in USD at reporting date")
    percent_ownership: Optional[float] = Field(None, description="Percentage of outstanding shares")
    change_shares_pct: Optional[float] = Field(None, description="Quarter-over-quarter percentage change")
    report_date: str = Field(..., description="13F filing period end date")
    form_type: str = "13F-HR"

class NetInsiderActivity(BaseModel):
    lookback_days: int = 90
    total_bought_shares: float
    total_sold_shares: float
    net_shares: float
    total_bought_usd: float
    total_sold_usd: float
    net_value_usd: float
    buy_transactions_count: int
    sell_transactions_count: int
    sentiment: str = Field(..., description="ACCUMULATION, DISTRIBUTION, or NEUTRAL")

class MajorFundPositioning(BaseModel):
    top5_concentration_pct: float = Field(..., description="Concentration of shares held by top 5 institutions")
    top10_concentration_pct: float = Field(..., description="Concentration of shares held by top 10 institutions")
    total_institutions_count: int = Field(..., description="Number of reporting 13F institutional holders")
    total_institutional_shares: int = Field(..., description="Aggregate shares held by institutional filers")
    key_funds: List[str] = Field(default_factory=list, description="Top institutional funds active in name")

class InsiderFilingsPayload(BaseModel):
    symbol: str
    company_name: Optional[str] = None
    cik: Optional[str] = None
    form4_transactions: List[Form4InsiderRecord] = Field(default_factory=list)
    net_activity_90d: NetInsiderActivity
    institutional_holders: List[InstitutionalHolder13F] = Field(default_factory=list)
    fund_positioning: MajorFundPositioning
    desk_takeaway: str

# --- FINRA SHORT VOLUME & DARK POOL FLOW MODELS ---

class FINRAShortVolumeRecord(BaseModel):
    date: str = Field(..., description="Trading date (YYYY-MM-DD)")
    short_volume: int = Field(..., description="Exempt and non-exempt short shares reported by FINRA")
    short_exempt_volume: int = Field(..., description="Rule 201 short exempt shares")
    total_volume: int = Field(..., description="Total consolidated volume across FINRA TRF / ADF")
    short_volume_ratio_pct: float = Field(..., description="Short Volume as % of Total FINRA Volume")
    market_center: str = Field(default="FINRA Consolidated / Off-Exchange TRF")

class DarkPoolAggregates(BaseModel):
    latest_short_ratio: float = Field(..., description="Latest single-session short volume ratio %")
    avg_30d_short_ratio: float = Field(..., description="30-day moving average short volume ratio %")
    estimated_off_exchange_pct: float = Field(..., description="Estimated percentage of tape cleared off-exchange")
    abnormal_short_activity: bool = Field(..., description="True if short ratio exceeds 2-sigma boundary")
    flow_regime: str = Field(..., description="ACCELERATING_OFF_EXCHANGE_SHORT, NEUTRAL_FLOW, SHORT_COVERING_ABSORPTION")

class ShortFlowPayload(BaseModel):
    symbol: str
    records: List[FINRAShortVolumeRecord] = Field(default_factory=list)
    aggregates: DarkPoolAggregates
    quant_summary: str
