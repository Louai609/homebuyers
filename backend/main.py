from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routes import public, payments, reports

app = FastAPI(title="Niwue API", version="0.1.0", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(payments.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "niwue-api"}
