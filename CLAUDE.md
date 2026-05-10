# CLAUDE.md

Niwue is the B2C consumer product built on top of the FuturaFix data platform.
It lets homebuyers look up any Dutch address and purchase a full building risk report.

## Architecture

```
FuturaFix (localhost:8001)   ← data engine (BAG, EP-Online, KNMI, AI analysis)
Niwue backend (localhost:8002) ← thin API: public search, PDF generation, Mollie payments
Niwue frontend (localhost:5174) ← consumer UI: address search, preview, checkout
```

## Commands

### Backend (Python / FastAPI)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # fill in keys

uvicorn main:app --reload --port 8002
```

### Frontend (React / Vite)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev      # dev server on http://localhost:5174
npm run build
npm run lint
```

## Key files

```
backend/
  main.py                        # FastAPI entry point — port 8002
  app/config/settings.py         # All env vars (FuturaFix URL, Mollie, Resend)
  app/routes/public.py           # GET /public/search, GET /public/preview/{bag_id}
  app/routes/payments.py         # POST /payments/create, POST /payments/webhook
  app/routes/reports.py          # GET /reports/download/{payment_id}
  app/services/payment_service.py  # Mollie API calls
  app/services/report_generator.py # WeasyPrint PDF generator
  app/templates/report.html       # A4 PDF template (Dutch)

frontend/src/
  App.tsx                        # Router + QueryClientProvider
  api/client.ts                  # Axios calls to Niwue backend
  pages/Home.tsx                 # Address search + hero
  pages/ReportPreview.tsx        # Building preview + Mollie checkout
  pages/PaymentResult.tsx        # Post-payment success/failure + PDF download
  hooks/useDebounce.ts
```

## Environment variables (backend)

| Variable | Description |
|---|---|
| `FUTURAFIX_API_URL` | FuturaFix backend base URL |
| `FUTURAFIX_API_KEY` | API key issued by FuturaFix `/auth/api-keys` |
| `MOLLIE_API_KEY` | `test_xxxx` for dev, `live_xxxx` for prod |
| `MOLLIE_REDIRECT_URL` | Frontend URL after payment (includes `{id}` placeholder) |
| `MOLLIE_WEBHOOK_URL` | Public HTTPS URL — Mollie must reach this |
| `REPORT_PRICE_EUR` | Price in euro cents (e.g. `2499` = €24.99) |
| `RESEND_API_KEY` | For emailing the PDF report |
| `EMAIL_FROM` | Sender address |

## Payment flow

1. User selects address → `/rapport/:bagId` preview page
2. User enters email → POST `/payments/create` → Mollie checkout URL
3. Mollie redirects to `/rapport/betaling/resultaat?payment_id=xxx`
4. Frontend polls GET `/payments/status/:id`
5. If paid → user downloads via GET `/reports/download/:payment_id`
6. Mollie webhook (POST `/payments/webhook`) handles async status updates

## Notes

- WeasyPrint requires system libraries (`libpango`, `libcairo`). On macOS: `brew install pango cairo`.
- The Mollie `redirectUrl` must contain `{id}` as a literal placeholder — Mollie substitutes the payment ID.
- For local Mollie webhook testing use [ngrok](https://ngrok.com): `ngrok http 8002`.
