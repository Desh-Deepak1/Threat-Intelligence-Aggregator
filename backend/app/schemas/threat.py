import ipaddress
import re
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field, field_validator


class IndicatorType(str, Enum):
    """Supported Indicator of Compromise (IOC) types."""
    IP = "ip"
    DOMAIN = "domain"
    URL = "url"
    HASH = "hash"


class InvestigationRequest(BaseModel):
    """Request schema for investigating a suspicious indicator."""
    indicator: str = Field(
        ...,
        min_length=3,
        max_length=2048,
        description="The IP address, domain name, URL, or file hash (MD5/SHA1/SHA256) to investigate."
    )
    indicator_type: Optional[IndicatorType] = Field(
        None,
        description="Optional type override. If omitted, the backend auto-detects the type."
    )

    @field_validator("indicator")
    @classmethod
    def sanitize_and_validate_indicator(cls, v: str) -> str:
        """Sanitize whitespace and guard against injection or malformed input."""
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Indicator cannot be empty or whitespace.")
        return cleaned


class ProviderResult(BaseModel):
    """Standardized response structure for an individual threat intelligence provider."""
    provider_name: str = Field(..., description="Name of the provider (e.g., VirusTotal, AlienVault OTX)")
    status: str = Field(..., description="Execution status: 'success', 'error', or 'rate_limited'")
    malicious_count: int = Field(0, ge=0, description="Number of security engines flagging as malicious")
    suspicious_count: int = Field(0, ge=0, description="Number of engines flagging as suspicious")
    harmless_count: int = Field(0, ge=0, description="Number of engines flagging as clean/harmless")
    undetected_count: int = Field(0, ge=0, description="Number of engines with no rating")
    details: Dict[str, Any] = Field(default_factory=dict, description="Normalized metadata (ASN, geolocation, tags, pulses)")
    error_message: Optional[str] = Field(None, description="Detailed error or rate-limit notice if provider failed")


class InvestigationResponse(BaseModel):
    """Comprehensive, aggregated threat investigation response."""
    indicator: str
    indicator_type: str
    risk_score: int = Field(..., ge=0, le=100, description="Calculated risk score from 0 (Safe) to 100 (Critical)")
    severity: str = Field(..., description="Categorical severity rating: Clean, Low, Medium, High, or Critical")
    providers: Dict[str, ProviderResult] = Field(..., description="Provider-by-provider breakdown")
    summary: str = Field(..., description="Explainable analysis summary of the threat detection results")
    timestamp: str = Field(..., description="UTC ISO-8601 timestamp of the investigation")