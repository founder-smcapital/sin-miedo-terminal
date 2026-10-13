"""
OpenBB Platform SDK Client Wrapper & Serialization Engine.
Handles initialization, provider authentication, and clean conversion of OBBject/pandas/dataclass structures.
"""
import logging
import math
from typing import Any, List, Dict, Optional, Union
from datetime import datetime, date

logger = logging.getLogger("sinmiedo.openbb")

# Global singleton state
_obb_instance = None
_openbb_available: Optional[bool] = None

def get_openbb():
    """
    Safely retrieves the OpenBB Platform SDK instance.
    Returns None if OpenBB is not installed or failed to initialize,
    enabling transparent fallback to native async regulatory providers.
    """
    global _obb_instance, _openbb_available
    if _openbb_available is False:
        return None
    
    if _obb_instance is not None:
        return _obb_instance

    try:
        from openbb import obb  # type: ignore
        _obb_instance = obb
        _openbb_available = True
        logger.info("OpenBB Platform SDK v5+ successfully loaded.")
        return _obb_instance
    except ImportError as e:
        logger.warning(f"OpenBB SDK not installed or missing sub-packages: {e}. Native async fallback active.")
        _openbb_available = False
        return None
    except Exception as e:
        logger.error(f"Error initializing OpenBB SDK: {e}")
        _openbb_available = False
        return None


def sanitize_value(val: Any) -> Any:
    """Recursively cleans NaNs, infinite values, and date/timestamps for clean JSON output."""
    if val is None:
        return None
    if isinstance(val, (float, int)):
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    if isinstance(val, (datetime, date)):
        return val.isoformat()
    if hasattr(val, "isoformat"):
        return val.isoformat()
    if isinstance(val, dict):
        return {k: sanitize_value(v) for k, v in val.items()}
    if isinstance(val, (list, tuple, set)):
        return [sanitize_value(v) for v in val]
    return val


def serialize_obb_result(obb_result: Any) -> List[Dict[str, Any]]:
    """
    Converts OpenBB OBBject results (DataFrames, Pydantic objects, or dicts)
    into clean, serialized JSON-compatible Python dictionaries.
    """
    if obb_result is None:
        return []

    # If it's an OpenBB OBBject, extract .results
    results = getattr(obb_result, "results", obb_result)
    if results is None:
        return []

    # Case 1: Pandas DataFrame
    try:
        import pandas as pd  # type: ignore
        if isinstance(results, pd.DataFrame):
            df = results.copy()
            # Replace NaNs with None
            df = df.where(pd.notnull(df), None)
            return [sanitize_value(row) for row in df.to_dict(orient="records")]
    except ImportError:
        pass

    # Case 2: List of Pydantic models or dicts
    if isinstance(results, list):
        parsed_list = []
        for item in results:
            if hasattr(item, "model_dump"):
                parsed_list.append(sanitize_value(item.model_dump()))
            elif hasattr(item, "dict"):
                parsed_list.append(sanitize_value(item.dict()))
            elif isinstance(item, dict):
                parsed_list.append(sanitize_value(item))
            else:
                parsed_list.append(sanitize_value(item.__dict__ if hasattr(item, "__dict__") else item))
        return parsed_list

    # Case 3: Single Pydantic model
    if hasattr(results, "model_dump"):
        return [sanitize_value(results.model_dump())]
    if hasattr(results, "dict"):
        return [sanitize_value(results.dict())]
    if isinstance(results, dict):
        return [sanitize_value(results)]

    return []
