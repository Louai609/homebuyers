import asyncio
import resend

from app.config.settings import settings


async def send_report_email(email: str, bag_id: str, pdf_bytes: bytes) -> None:
    resend.api_key = settings.resend_api_key
    params: resend.Emails.SendParams = {
        "from": settings.email_from,
        "to": [email],
        "subject": f"Uw Niwue gebouwrapport – {bag_id}",
        "html": (
            f"<p>Geachte klant,</p>"
            f"<p>Uw gebouwrapport voor BAG-ID <strong>{bag_id}</strong> is bijgesloten.</p>"
            f"<p>Met vriendelijke groet,<br/>Het Niwue-team</p>"
        ),
        "attachments": [
            {
                "content": list(pdf_bytes),
                "filename": f"niwue-rapport-{bag_id}.pdf",
                "content_type": "application/pdf",
            }
        ],
    }
    await asyncio.to_thread(resend.Emails.send, params)
