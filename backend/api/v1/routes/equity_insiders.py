"""
SEC EDGAR Corporate Filings & Insiders FastAPI Route Module
Serves Form 4 insider trading transactions, 13F institutional ownership, and net insider flow sentiment.
"""
from fastapi import APIRouter, Query, status, Path
from backend.models.equity import InsiderFilingsPayload
from backend.models.common import APIResponse
from backend.services.sec_service import sec_insider_service

router = APIRouter(prefix="/equity", tags=["Equities & Regulatory Disclosures"])

@router.get(
    "/insider-filings",
    response_model=APIResponse[InsiderFilingsPayload],
    status_code=status.HTTP_200_OK,
    summary="SEC EDGAR Form 4 Insider Trades & 13F Institutional Holdings",
    description=(
        "Pulls Form 4 insider transactions and 13F institutional portfolios directly from SEC EDGAR "
        "and OpenBB SEC provider. Aggregates net insider buying vs selling over 90 days and details top institutional fund concentration."
    )
)
async def get_equity_insider_filings(
    symbol: str = Query(
        default="AAPL",
        pattern=r"^[A-Za-z0-9.-]{1,10}$",
        description="Equity ticker symbol (e.g., AAPL, NVDA, MSFT)"
    ),
    limit: int = Query(
        default=25,
        ge=1,
        le=100,
        description="Maximum number of recent Form 4 filings to parse"
    )
):
    return await sec_insider_service.get_insider_filings(symbol=symbol, limit=limit)
