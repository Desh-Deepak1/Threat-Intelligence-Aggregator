import logging
from typing import Any, Dict
import httpx
from app.config import settings
from app.schemas.threat import ProviderResult

logger = logging.getLogger(__name__)


class AlienVaultOTXClient:
    """Asynchronous client for AlienVault Open Threat Exchange (OTX) API v1."""
    BASE_URL = "https://otx.alienvault.com/api/v1"

    async def investigate(self, indicator: str, indicator_type: str) -> ProviderResult:
        """Query AlienVault OTX DirectConnect API based on indicator type."""
        api_key = settings.ALIENVAULT_OTX_API_KEY
        if not api_key or api_key == "your_alienvault_otx_api_key_here":
            return ProviderResult(
                provider_name="AlienVault OTX",
                status="error",
                error_message="AlienVault OTX API key not configured."
            )

        headers = {"X-OTX-API-KEY": api_key}

        # Map indicator types to OTX general endpoints
        if indicator_type == "ip":
            endpoint = f"{self.BASE_URL}/indicators/IPv4/{indicator}/general"
        elif indicator_type == "domain":
            endpoint = f"{self.BASE_URL}/indicators/domain/{indicator}/general"
        elif indicator_type == "url":
            endpoint = f"{self.BASE_URL}/indicators/url/{indicator}/general"
        elif indicator_type == "hash":
            endpoint = f"{self.BASE_URL}/indicators/file/{indicator}/general"
        else:
            return ProviderResult(
                provider_name="AlienVault OTX",
                status="error",
                error_message=f"Unsupported indicator type for AlienVault OTX: {indicator_type}"
            )

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(endpoint, headers=headers)

                if response.status_code == 404:
                    return ProviderResult(
                        provider_name="AlienVault OTX",
                        status="success",
                        malicious_count=0,
                        suspicious_count=0,
                        harmless_count=1,
                        undetected_count=0,
                        details={"pulse_count": 0, "message": "No community pulses found on OTX."}
                    )
                elif response.status_code == 429:
                    return ProviderResult(
                        provider_name="AlienVault OTX",
                        status="rate_limited",
                        error_message="AlienVault OTX rate limit exceeded (429 Too Many Requests)."
                    )
                elif response.status_code != 200:
                    return ProviderResult(
                        provider_name="AlienVault OTX",
                        status="error",
                        error_message=f"API error: HTTP {response.status_code} - {response.text[:200]}"
                    )

                data = response.json()
                pulse_info = data.get("pulse_info", {})
                pulse_count = pulse_info.get("count", 0)
                pulses = pulse_info.get("pulses", [])

                # Extract notable metadata from top pulses
                extracted_tags = []
                for p in pulses[:5]:  # Take top 5 pulses
                    extracted_tags.extend(p.get("tags", []))

                # If pulses exist, map threat presence
                malicious_indicators = 1 if pulse_count > 0 else 0

                return ProviderResult(
                    provider_name="AlienVault OTX",
                    status="success",
                    malicious_count=malicious_indicators,
                    suspicious_count=0,
                    harmless_count=0 if pulse_count > 0 else 1,
                    undetected_count=0,
                    details={
                        "pulse_count": pulse_count,
                        "reputation": data.get("reputation", 0),
                        "country_name": data.get("country_name"),
                        "asn": data.get("asn"),
                        "tags": list(set(extracted_tags))[:10],  # Deduplicated tags
                        "validation": data.get("validation", [])
                    }
                )

            except httpx.TimeoutException:
                return ProviderResult(
                    provider_name="AlienVault OTX",
                    status="error",
                    error_message="Request timed out while connecting to AlienVault OTX API."
                )
            except Exception as e:
                logger.error(f"AlienVault OTX integration exception: {str(e)}")
                return ProviderResult(
                    provider_name="AlienVault OTX",
                    status="error",
                    error_message=f"Unexpected error: {str(e)}"
                )