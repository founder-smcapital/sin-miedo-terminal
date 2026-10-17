"""
Institutional Terminal Configuration
Loads environment variables and sets operational boundaries for OpenBB, SEC EDGAR, FRED, CFTC, and FINRA feeds.
"""
import os
from typing import List
from pydantic import Field

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    
    class Settings(BaseSettings):
        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore",
            case_sensitive=False
        )

        APP_NAME: str = "Sin Miedo Capital - Quant Terminal API"
        VERSION: str = "2.4.0"
        API_V1_PREFIX: str = "/api/v1"
        ENVIRONMENT: str = Field(default="production", env="ENVIRONMENT")
        DEBUG: bool = Field(default=False, env="DEBUG")
        PORT: int = Field(default=8001, env="PORT")
        HOST: str = Field(default="0.0.0.0", env="HOST")

        # OpenBB Platform SDK Configuration
        OPENBB_PAT: str = Field(default="", env="OPENBB_PAT")
        OPENBB_AUTO_BUILD: bool = Field(default=True, env="OPENBB_AUTO_BUILD")

        # Federal Reserve Economic Data (FRED)
        FRED_API_KEY: str = Field(
            default="",
            env="FRED_API_KEY",
            description="FRED API key for yield curve & macroeconomic data"
        )

        # SEC EDGAR Regulatory Requirements
        # SEC requires user agent in format: "Sample Company Name AdminContact@<sample company domain>.com"
        SEC_USER_AGENT: str = Field(
            default="SinMiedoCapital-QuantTerminal/2.4 (admin@sinmiedocapital.com)",
            env="SEC_USER_AGENT",
            description="Compliant User-Agent header required by SEC EDGAR fair access policy"
        )

        # Caching & Rate Limits
        CACHE_TTL_SECONDS: int = Field(default=300, env="CACHE_TTL_SECONDS")
        REQUEST_TIMEOUT_SECONDS: float = Field(default=15.0, env="REQUEST_TIMEOUT_SECONDS")

        # Inter-service Authentication
        INTERNAL_SERVICE_TOKEN: str = Field(
            default="sm-internal-quant-gateway-token",
            env="INTERNAL_SERVICE_TOKEN",
            description="Shared authentication secret between Node BFF and Python quant microservice"
        )
        REQUIRE_INTERNAL_AUTH: bool = Field(
            default=False,
            env="REQUIRE_INTERNAL_AUTH",
            description="Enforce X-Internal-Token verification on private quant endpoints"
        )

        # CORS Origins for Terminal Frontend
        CORS_ORIGINS: List[str] = [
            "https://io.sinmiedocapital.com",
            "http://localhost:3000",
            "http://localhost:5173",
            "https://sinmiedo-terminal.onrender.com",
            "*"
        ]

except ImportError:
    # Lightweight fallback for minimal environments without pydantic-settings
    class Settings:  # type: ignore
        APP_NAME: str = "Sin Miedo Capital - Quant Terminal API"
        VERSION: str = "2.4.0"
        API_V1_PREFIX: str = "/api/v1"
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
        DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
        PORT: int = int(os.getenv("PORT", "8001"))
        HOST: str = os.getenv("HOST", "0.0.0.0")

        OPENBB_PAT: str = os.getenv("OPENBB_PAT", "")
        OPENBB_AUTO_BUILD: bool = os.getenv("OPENBB_AUTO_BUILD", "true").lower() == "true"
        FRED_API_KEY: str = os.getenv("FRED_API_KEY", "")
        SEC_USER_AGENT: str = os.getenv("SEC_USER_AGENT", "SinMiedoCapital-QuantTerminal/2.4 (admin@sinmiedocapital.com)")
        CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "300"))
        REQUEST_TIMEOUT_SECONDS: float = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "15.0"))
        INTERNAL_SERVICE_TOKEN: str = os.getenv("INTERNAL_SERVICE_TOKEN", "sm-internal-quant-gateway-token")
        REQUIRE_INTERNAL_AUTH: bool = os.getenv("REQUIRE_INTERNAL_AUTH", "false").lower() == "true"
        CORS_ORIGINS: List[str] = [
            "https://io.sinmiedocapital.com",
            "http://localhost:3000",
            "http://localhost:5173",
            "https://sinmiedo-terminal.onrender.com",
            "*"
        ]

settings = Settings()
