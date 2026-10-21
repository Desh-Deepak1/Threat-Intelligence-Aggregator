import asyncio
import ipaddress
import re
from datetime import datetime, timezone
from typing import Optional
from app.schemas.threat import InvestigationResponse, ProviderResult
from app.services.alienvault import AlienVaultOTXClient
from app.services.risk_scorer import RiskScorer
from app.services.virustotal import VirusTotalClient


class ThreatAggregatorService:
    """Orchestrates multi-provider threat intelligence collection and analysis."""

    def __init__(self):
        self.vt_client = VirusTotalClient()
        self.otx_client = AlienVaultOTXClient()

    @staticmethod
    def detect_indicator_type(indicator: str) -> str:
        """Automatically detect whether the indicator is an IP, domain, URL, or file hash."""
        # 1. Check IP address (IPv4 or IPv6)
        try:
            ipaddress.ip_address(indicator)
            return "ip"
        except ValueError:
            pass

        # 2. Check File Hash (MD5: 32 hex, SHA1: 40 hex, SHA256: 64 hex)
        if re.fullmatch(r"^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$", indicator):
            return "hash"

        # 3. Check URL (starts with http:// or https:// or contains path separators)
        if indicator.startswith(("http://", "https://")) or "/" in indicator:
            return "url"

        # 4. Default fallback to Domain name
        return "domain"

    async def investigate_indicator(self, indicator: str, requested_type: Optional[str] = None) -> InvestigationResponse:
        """Execute concurrent queries to VirusTotal and AlienVault OTX, then aggregate results."""
        indicator_type = requested_type or self.detect_indicator_type(indicator)

        # Dispatch concurrent async requests using asyncio.gather
        vt_task = self.vt_client.investigate(indicator, indicator_type)
        otx_task = self.otx_client.investigate(indicator, indicator_type)

        vt_result, otx_result = await asyncio.gather(vt_task, otx_task)

        providers = {
            "VirusTotal": vt_result,
            "AlienVault OTX": otx_result
        }

        # Calculate risk score and generate summary
        risk_score, severity, summary = RiskScorer.calculate_risk(providers)

        return InvestigationResponse(
            indicator=indicator,
            indicator_type=indicator_type,
            risk_score=risk_score,
            severity=severity,
            providers=providers,
            summary=summary,
            timestamp=datetime.now(timezone.utc).isoformat()
        )