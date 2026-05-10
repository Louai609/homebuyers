from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Niwue API"
    debug: bool = False

    # FuturaFix backend URL — all building data comes from here
    futurafix_api_url: str = "http://localhost:8001"
    futurafix_api_key: str = ""

    # Mollie payment provider
    mollie_api_key: str = ""
    mollie_redirect_url: str = "http://localhost:5174/report/payment/result"
    mollie_webhook_url: str = "http://localhost:8002/payments/webhook"

    # Report pricing (cents)
    report_price_eur: int = 2499  # €24.99

    # Email (Resend)
    resend_api_key: str = ""
    email_from: str = "rapport@niwue.nl"

    # Frontend URL (for CORS)
    frontend_url: str = "http://localhost:5174"

    class Config:
        env_file = ".env"


settings = Settings()
