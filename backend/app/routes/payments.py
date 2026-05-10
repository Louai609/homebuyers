import logging

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.config.settings import settings
from app.services.payment_service import create_payment, get_payment_status
from app.services.report_generator import generate_report
from app.services.email_service import send_report_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])


class PaymentRequest(BaseModel):
    bag_id: str
    email: str


@router.post("/create")
async def create_report_payment(body: PaymentRequest):
    """Create a Mollie payment for a building report."""
    payment = await create_payment(bag_id=body.bag_id, email=body.email)
    return {"payment_id": payment["id"], "checkout_url": payment["_links"]["checkout"]["href"]}


@router.post("/webhook")
async def mollie_webhook(request: Request):
    """Mollie calls this after a payment status change."""
    form = await request.form()
    payment_id = form.get("id")
    if not payment_id:
        raise HTTPException(status_code=400, detail="Missing payment id")

    result = await get_payment_status(payment_id)

    if result["status"] == "paid":
        metadata = result.get("metadata", {})
        email = metadata.get("email")
        bag_id = metadata.get("bag_id")
        if email and bag_id:
            try:
                pdf_bytes = await generate_report(bag_id)
                await send_report_email(email, bag_id, pdf_bytes)
            except Exception:
                logger.exception(
                    "Failed to send report for payment %s bag_id=%s", payment_id, bag_id
                )
                # Do NOT re-raise — Mollie retries on non-200

    return {"status": "ok"}


@router.get("/status/{payment_id}")
async def payment_status(payment_id: str):
    """Poll payment status from the frontend after redirect."""
    result = await get_payment_status(payment_id)
    return result
