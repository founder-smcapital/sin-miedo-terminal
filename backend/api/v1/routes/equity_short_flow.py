"""
FINRA Short Volume & Dark Pool Flow Route Module
Serves off-exchange TRF daily short sale volume, Rule 201 exempt ratios, and 30-day statistical anomaly detection.
"""
from fastapi import APIRouter, Query, status
from backend.models.equity import ShortFlowPayload
from backend.models.common import APIResponse
from backend.services.finra_service import finra_short_flow_service

router = APIRouter(prefix="/equity", tags=["Equities & Dark Pool Flow"])

@router.get(
    "/short-flow",
    response_model=APIResponse[ShortFlowPayload],
    status_code=status.HTTP_200_OK,
    summary="FINRA Short Sale Volume & Dark Pool Flow Aggregates",
    description=(
        "Aggregates daily off-exchange short sale volume and Rule 201 short exempt shares reported across "
        "FINRA TRF and ADF facilities. Computes 30-day moving average short ratios and flags abnormal dark pool flow regimes."
    )
)
async def get_equity_short_flow(
    symbol: str = Query(
        default="AAPL",
        pattern=r"^[A-Za-z0-9.-]{1,10}$",
        description="Equity ticker symbol (e.g., AAPL, NVDA, TSLA)"
    ),
    days: int = Query(
        default=30,
        ge=5,
        le=90,
        description="Historical lookback window in calendar days (5 to 90)"
    )
):
    return await finra_short_flow_service.get_short_flow(symbol=symbol, days=days)
