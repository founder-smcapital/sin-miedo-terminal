"""
Institutional Market Structure & CFTC Commitment of Traders (COT) Route Module
Serves institutional asset manager and leveraged fund positioning across major futures contracts.
"""
from typing import Optional
from fastapi import APIRouter, Query, status
from backend.models.derivatives import COTReportPayload
from backend.models.common import APIResponse
from backend.services.cot_service import cot_report_service

router = APIRouter(prefix="/derivatives", tags=["Derivatives & Market Structure"])

@router.get(
    "/cot",
    response_model=APIResponse[COTReportPayload],
    status_code=status.HTTP_200_OK,
    summary="CFTC Commitment of Traders (COT) Positioning",
    description=(
        "Queries CFTC weekly reports via openbb-cftc to extract disaggregated institutional "
        "Asset Manager and Leveraged Fund (Hedge Fund / CTA) positioning across E-Mini S&P 500, "
        "COMEX Gold, NYMEX Crude Oil, and CBOT 10Y Treasury Notes."
    )
)
async def get_cftc_cot_report(
    market: Optional[str] = Query(
        default="SP500",
        description="Benchmark market filter: 'SP500', 'GOLD', 'CRUDE_OIL', 'UST_10Y', or 'ALL'"
    )
):
    return await cot_report_service.get_cot_positioning(market=market)
