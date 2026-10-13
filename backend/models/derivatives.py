"""
Derivatives Market Structure & CFTC Commitment of Traders (COT) Models
"""
from typing import List, Optional
from pydantic import BaseModel, Field

class COTPositionCategory(BaseModel):
    long: int = Field(..., description="Gross Long contracts held")
    short: int = Field(..., description="Gross Short contracts held")
    spreading: Optional[int] = Field(0, description="Spreading positions (arbitrage/spreads)")
    net: int = Field(..., description="Net positioning (Long - Short)")
    net_change: int = Field(default=0, description="Week-over-week net change in contracts")
    pct_of_open_interest: float = Field(default=0.0, description="Net as % of aggregate Open Interest")

class COTPositionRecord(BaseModel):
    contract_name: str = Field(..., description="Benchmark futures contract name")
    symbol_tag: str = Field(..., description="Universal terminal tag: SP500, GOLD, CRUDE_OIL, UST_10Y")
    exchange: str = Field(..., description="Listing exchange (CME, COMEX, NYMEX, CBOT)")
    cftc_code: str = Field(..., description="CFTC contract identification code")
    report_date: str = Field(..., description="CFTC survey date (Tuesday settlement)")
    release_date: str = Field(..., description="CFTC public release date (Friday)")
    open_interest: int = Field(..., description="Total active Open Interest")
    open_interest_change: int = Field(default=0, description="Change in OI vs prior week")
    
    # Disaggregated participant breakdowns
    asset_managers: COTPositionCategory = Field(..., description="Institutional asset managers (pension funds, mutual funds, endowments)")
    leveraged_funds: COTPositionCategory = Field(..., description="Hedge funds, CTAs, and proprietary trading desks")
    dealers_intermediaries: Optional[COTPositionCategory] = Field(None, description="Sell-side liquidity providers and market makers")
    non_reportables: Optional[COTPositionCategory] = Field(None, description="Retail traders and small non-reportable accounts")

    # Quant positioning analytics
    sentiment_signal: str = Field(..., description="EXTREME_LONG, BULLISH_BIAS, NEUTRAL, BEARISH_BIAS, EXTREME_SHORT")
    asset_manager_zscore_1y: float = Field(..., description="1-year rolling Z-score of Institutional Net positioning")
    leveraged_funds_zscore_1y: float = Field(..., description="1-year rolling Z-score of Leveraged/CTA Net positioning")
    historical_percentile_3y: float = Field(..., description="3-year percentile of Leveraged Fund positioning")

class COTReportPayload(BaseModel):
    report_type: str = "CFTC Disaggregated Commitments of Traders (Traders in Financial Futures / Commodities)"
    as_of_date: str
    contracts: List[COTPositionRecord] = Field(default_factory=list)
    macro_positioning_summary: str
