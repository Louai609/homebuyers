import httpx
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from datetime import datetime
import weasyprint

from app.config.settings import settings

TEMPLATE_DIR = Path(__file__).parent.parent / "templates"

_NL_MONTHS = {
    1: "januari", 2: "februari", 3: "maart", 4: "april", 5: "mei", 6: "juni",
    7: "juli", 8: "augustus", 9: "september", 10: "oktober", 11: "november", 12: "december",
}


def _dutch_date_string() -> str:
    now = datetime.now()
    return f"{now.day} {_NL_MONTHS[now.month]} {now.year}"


async def _fetch_building_data(bag_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.futurafix_api_url}/api/v1/data/buildings/{bag_id}/risk-summary",
            headers={"X-API-Key": settings.futurafix_api_key},
            timeout=15.0,
        )
        response.raise_for_status()
        return response.json()


def _map_building_data(api_data: dict) -> dict:
    postcode = api_data.get("postcode") or ""
    flood_raw = api_data.get("flood_risk_zone")
    flood_display = "Ja" if flood_raw is True else ("Nee" if flood_raw is False else None)
    return {
        "bag_id":         api_data.get("bag_id"),
        "address":        f"Postcode: {postcode}" if postcode else "–",
        "build_year":     api_data.get("construction_era"),
        "use_type":       api_data.get("building_type"),
        "area":           api_data.get("floor_area_m2"),
        "is_monument":    False,
        "risk_score":     api_data.get("risk_score"),
        "energy_label":   api_data.get("energy_label"),
        "flood_risk_zone": flood_display,
        "soil_type":      api_data.get("soil_type"),
        "neighborhood":   postcode or None,
        "municipality":   None,
        "avg_woz_value":  None,
        "ai_analysis":    None,
    }


async def generate_report(bag_id: str) -> bytes:
    raw = await _fetch_building_data(bag_id)
    building = _map_building_data(raw)

    env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))
    template = env.get_template("report.html")
    html = template.render(building=building, generated_at=_dutch_date_string())

    pdf = weasyprint.HTML(string=html, base_url=str(TEMPLATE_DIR)).write_pdf()
    return pdf
