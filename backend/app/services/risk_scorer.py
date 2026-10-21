from typing import Dict
from app.schemas.threat import ProviderResult


class RiskScorer:
    """Calculates explainable threat scores and severity levels from aggregated provider results."""

    @staticmethod
    def calculate_risk(providers: Dict[str, ProviderResult]) -> tuple[int, str, str]:
        """
        Compute risk score (0-100), severity tier, and summary text.
        
        Scoring Logic:
        - VirusTotal malicious engines contribute heavily.
        - AlienVault OTX community pulse count contributes threat actor context.
        """
        vt = providers.get("VirusTotal")
        otx = providers.get("AlienVault OTX")

        vt_malicious = vt.malicious_count if vt and vt.status == "success" else 0
        vt_suspicious = vt.suspicious_count if vt and vt.status == "success" else 0
        
        otx_pulses = 0
        if otx and otx.status == "success":
            otx_pulses = otx.details.get("pulse_count", 0)

        # Base score calculation
        score = 0
        if vt_malicious > 0:
            # Scale score based on number of flagging engines
            score += min(75, vt_malicious * 5)
        
        if vt_suspicious > 0:
            score += min(15, vt_suspicious * 2)

        if otx_pulses > 0:
            # Community pulses add corroborating threat intelligence
            score += min(30, otx_pulses * 3)

        # Cap score between 0 and 100
        risk_score = max(0, min(100, score))

        # Determine severity category
        if risk_score >= 75:
            severity = "Critical"
        elif risk_score >= 50:
            severity = "High"
        elif risk_score >= 25:
            severity = "Medium"
        elif risk_score > 0:
            severity = "Low"
        else:
            severity = "Clean"

        # Generate explainable summary
        summary_parts = []
        if vt and vt.status == "success":
            summary_parts.append(f"VirusTotal detected {vt_malicious} malicious and {vt_suspicious} suspicious engines.")
        elif vt:
            summary_parts.append(f"VirusTotal provider status: {vt.status} ({vt.error_message or 'Unavailable'}).")

        if otx and otx.status == "success":
            summary_parts.append(f"AlienVault OTX identified {otx_pulses} threat intelligence pulse(s).")
        elif otx:
            summary_parts.append(f"AlienVault OTX provider status: {otx.status} ({otx.error_message or 'Unavailable'}).")

        if risk_score == 0:
            summary = "No immediate threats detected across integrated intelligence providers. Indicator appears clean or unknown."
        else:
            summary = f"Threat indicators identified. { ' '.join(summary_parts) }"

        return risk_score, severity, summary