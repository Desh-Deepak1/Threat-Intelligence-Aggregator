import base64
import logging
from typing import Any, Dict
import httpx
from app.config import settings
from app.schemas.threat import ProviderResult

logger = logging.getLogger(__name__)


class VirusTotalClient:
    """Asynchronous client for VirusTotal API v3."""
    BASE_URL = "https://www.virustotal.com/api/v3"

    @staticmethod
    def _encode_url(url: str) -> str:
        """Encode URL to unpadded base64url format required by VirusTotal v3."""
        encoded = base64.urlsafe_b64encode(url.encode("utf-8"))
        return encoded.decode("utf-8").strip("=")

    async def investigate(self, indicator: str, indicator_type: str) -> ProviderResult:
        """Query VirusTotal API v3 based on indicator type."""
        api_key = settings.VIRUSTOTAL_API_KEY
        if not api_key or api_key == "your_virustotal_api_key_here":
            return ProviderResult(
                provider_name="VirusTotal",
                status="error",
                error_message="VirusTotal API key not configured."
            )

        headers = {"x-apikey": api_key}
        
        # Determine endpoint based on type
        if indicator_type == "ip":
            endpoint = f"{self.BASE_URL}/ip_addresses/{indicator}"
        elif indicator_type == "domain":
            endpoint = f"{self.BASE_URL}/domains/{indicator}"
        elif indicator_type == "url":
            url_id = self._encode_url(indicator)
            endpoint = f"{self.BASE_URL}/urls/{url_id}"
        elif indicator_type == "hash":
            endpoint = f"{self.BASE_URL}/files/{indicator}"
        else:
            return ProviderResult(
                provider_name="VirusTotal",
                status="error",
                error_message=f"Unsupported indicator type for VirusTotal: {indicator_type}"
            )

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(endpoint, headers=headers)
                
                if response.status_code == 404:
                    return ProviderResult(
                        provider_name="VirusTotal",
                        status="success",
                        malicious_count=0,
                        suspicious_count=0,
                        harmless_count=0,
                        undetected_count=1,
                        details={"message": "Indicator not found in VirusTotal database (clean or unknown)."}
                    )
                elif response.status_code == 429:
                    return ProviderResult(
                        provider_name="VirusTotal",
                        status="rate_limited",
                        error_message="VirusTotal rate limit exceeded (429 Too Many Requests)."
                    )
                elif response.status_code != 200:
                    return ProviderResult(
                        provider_name="VirusTotal",
                        status="error",
                        error_message=f"API error: HTTP {response.status_code} - {response.text[:200]}"
                    )

                data = response.json().get("data", {})
                attributes = data.get("attributes", {})
                stats = attributes.get("last_analysis_stats", {})

                return ProviderResult(
                    provider_name="VirusTotal",
                    status="success",
                    malicious_count=stats.get("malicious", 0),
                    suspicious_count=stats.get("suspicious", 0),
                    harmless_count=stats.get("harmless", 0),
                    undetected_count=stats.get("undetected", 0),
                    details={
                        "reputation": attributes.get("reputation", 0),
                        "country": attributes.get("country"),
                        "as_owner": attributes.get("as_owner") or attributes.get("asn"),
                        "tags": attributes.get("tags", []),
                        "last_analysis_date": attributes.get("last_analysis_date")
                    }
                )

            except httpx.TimeoutException:
                return ProviderResult(
                    provider_name="VirusTotal",
                    status="error",
                    error_message="Request timed out while connecting to VirusTotal API."
                )
            except Exception as e:
                logger.error(f"VirusTotal integration exception: {str(e)}")
                return ProviderResult(
                    provider_name="VirusTotal",
                    status="error",
                    error_message=f"Unexpected error: {str(e)}"
                )