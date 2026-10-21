import csv
import io
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter(prefix="/api/v1", tags=["Investigation History & Reports"])


@router.get("/history/export", status_code=status.HTTP_200_OK)
async def export_investigation_csv():
    """Export investigation summary reports as a downloadable CSV file."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write CSV header
    writer.writerow(["Timestamp", "Indicator", "Type", "Risk Score", "Severity", "Summary"])
    
    # Example export row for demonstration/template
    writer.writerow(["2026-10-21T00:00:00Z", "8.8.8.8", "ip", 0, "Clean", "No immediate threats detected."])
    
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=threat_intelligence_report.csv"}
    )