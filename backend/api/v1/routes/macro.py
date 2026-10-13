"""
Macro & Yield Curve FastAPI Route Module
Serves real-time Treasury yields (3M, 2Y, 10Y, 30Y), 10Y-2Y & 10Y-3M spreads, and 24-month inversion history.
"""
from fastapi import APIRouter, Query, status
from backend.models.macro import YieldCurvePayload
from backend.models.common import APIResponse
from backend.services.macro_service import macro_yield_service

router = APIRouter(prefix="/macro", tags=["Macro & Sovereign Fixed Income"])

@router.get(
    "/yield-curve",
    response_model=APIResponse[YieldCurvePayload],
    status_code=status.HTTP_200_OK,
    summary="U.S. Treasury Yield Curve & Inversion Tracking",
    description=(
        "Retrieves real-time benchmark Treasury yields (3M, 2Y, 10Y, 30Y) via OpenBB FRED / Federal Reserve, "
        "computes 10Y-2Y and 10Y-3M slope spreads in basis points, and quantifies historical curve inversion episodes "
        "over the specified lookback horizon."
    )
)
async def get_macro_yield_curve(
    lookback_months: int = Query(
        default=24,
        ge=1,
        le=120,
        description="Historical lookback window in months for curve inversion analysis"
    )
):
    return await macro_yield_service.get_yield_curve(lookback_months=lookback_months)
