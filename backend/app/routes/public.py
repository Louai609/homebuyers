from fastapi import APIRouter, HTTPException, Query
import httpx

from app.config.settings import settings

router = APIRouter(prefix="/public", tags=["public"])

PDOK_SUGGEST = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest"
PDOK_FREE    = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free"


@router.get("/search")
async def search_address(q: str = Query(..., min_length=3)):
    """Search Dutch addresses using the PDOK Locatieserver (free, no key required)."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                PDOK_FREE,
                params={"q": q, "fq": "type:adres", "rows": 8, "fl": "id,weergavenaam,adresseerbaarobject_id"},
                timeout=10.0,
            )
            response.raise_for_status()
            docs = response.json().get("response", {}).get("docs", [])
            return [
                {
                    "bag_id": doc.get("adresseerbaarobject_id", doc["id"]),
                    "address": doc.get("weergavenaam", ""),
                }
                for doc in docs
                if doc.get("adresseerbaarobject_id") or doc.get("id")
            ]
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="PDOK address service unavailable")


@router.get("/preview/{bag_id}")
async def preview_building(bag_id: str):
    """Return a public risk preview from FuturaFix for a given BAG verblijfsobject ID."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.futurafix_api_url}/api/v1/data/buildings/{bag_id}/risk-summary",
                headers={"X-API-Key": settings.futurafix_api_key},
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()
            return {
                "bag_id": bag_id,
                "address": data.get("address"),
                "build_year": data.get("avg_construction_year"),
                "risk_score": data.get("risk_score"),
                "energy_label": data.get("energy_label"),
                "is_monument": False,
                "flood_risk_zone": data.get("flood_risk_zone"),
                "soil_type": data.get("soil_type"),
                "neighborhood": data.get("postcode"),
            }
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Building not yet in FuturaFix — try again after enrichment")
            raise HTTPException(status_code=e.response.status_code, detail="FuturaFix error")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="FuturaFix service unavailable")
