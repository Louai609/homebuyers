import httpx

from app.config.settings import settings

MOLLIE_BASE = "https://api.mollie.com/v2"


def _headers() -> dict:
    return {"Authorization": f"Bearer {settings.mollie_api_key}"}


async def create_payment(bag_id: str, email: str) -> dict:
    payload = {
        "amount": {"currency": "EUR", "value": f"{settings.report_price_eur / 100:.2f}"},
        "description": f"Niwue Gebouwrapport – {bag_id}",
        "redirectUrl": f"{settings.mollie_redirect_url}?payment_id={{id}}",
        "webhookUrl": settings.mollie_webhook_url,
        "metadata": {"bag_id": bag_id, "email": email},
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{MOLLIE_BASE}/payments",
            json=payload,
            headers=_headers(),
            timeout=10.0,
        )
        response.raise_for_status()
        return response.json()


async def get_payment_status(payment_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MOLLIE_BASE}/payments/{payment_id}",
            headers=_headers(),
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        return {
            "id": data["id"],
            "status": data["status"],
            "metadata": data.get("metadata", {}),
        }
