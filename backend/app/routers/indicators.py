from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.threat import InvestigationRequest, InvestigationResponse
from app.services.aggregator import ThreatAggregatorService

router = APIRouter(prefix="/api/v1", tags=["Threat Intelligence"])
aggregator_service = ThreatAggregatorService()


@router.post("/investigate", response_model=InvestigationResponse, status_code=status.HTTP_200_OK)
async def investigate_indicator(
    payload: InvestigationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Investigate an Indicator of Compromise (IP, Domain, URL, or File Hash) 
    by querying VirusTotal and AlienVault OTX concurrently.
    """
    try:
        result = await aggregator_service.investigate_indicator(
            indicator=payload.indicator,
            requested_type=payload.indicator_type
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Investigation failed: {str(e)}"
        )