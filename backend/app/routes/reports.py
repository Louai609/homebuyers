from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io

from app.services.report_generator import generate_report
from app.services.payment_service import get_payment_status

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/download/{payment_id}")
async def download_report(payment_id: str):
    """Download a PDF report after a successful payment."""
    payment = await get_payment_status(payment_id)

    if payment["status"] != "paid":
        raise HTTPException(status_code=402, detail="Payment not completed")

    bag_id = payment.get("metadata", {}).get("bag_id")
    if not bag_id:
        raise HTTPException(status_code=400, detail="No building linked to this payment")

    pdf_bytes = await generate_report(bag_id)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=niwue-rapport-{bag_id}.pdf"},
    )
