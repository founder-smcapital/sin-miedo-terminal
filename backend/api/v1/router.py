"""
Master v1 API Router
Aggregates Macro, SEC Filings, Derivatives COT, and FINRA Short Volume route modules.
"""
from fastapi import APIRouter
from backend.api.v1.routes.macro import router as macro_router
from backend.api.v1.routes.equity_insiders import router as equity_insiders_router
from backend.api.v1.routes.derivatives_cot import router as derivatives_cot_router
from backend.api.v1.routes.equity_short_flow import router as equity_short_flow_router

api_v1_router = APIRouter()

# Register sub-routers
api_v1_router.include_router(macro_router)
api_v1_router.include_router(equity_insiders_router)
api_v1_router.include_router(derivatives_cot_router)
api_v1_router.include_router(equity_short_flow_router)
