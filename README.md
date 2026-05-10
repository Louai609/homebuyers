# 🏠 Homebuyers — Niwue

**Dutch Building Risk Reports for Homebuyers**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Mollie](https://img.shields.io/badge/Mollie-Payments-FF6640?style=for-the-badge)](https://mollie.com)
[![FuturaFix](https://img.shields.io/badge/Powered_by-FuturaFix-4169E1?style=for-the-badge)](https://github.com/Louai609/futurafix.io)

Niwue lets homebuyers look up any Dutch address and purchase a full AI-powered building risk report — powered by the [FuturaFix](https://github.com/Louai609/futurafix.io) data platform.

---

## 📋 Table of Contents

- [How It Works](#-how-it-works)
- [Architecture](#️-architecture)
- [Payment Flow](#-payment-flow)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Tech Stack](#-tech-stack)

---

## 💡 How It Works

```mermaid
graph LR
    Homebuyer["🏠 Homebuyer"]

    Homebuyer --> A["Search address\nany Dutch postcode"]
    A --> B["View free preview\nbuilding summary & risk score"]
    B --> C["Pay €24.99\nvia Mollie iDEAL / credit card"]
    C --> D["Download PDF report\nAI risk analysis · energy · soil · weather"]
    D --> E["Report emailed\nvia Resend"]
```

---

## 🏛️ Architecture

```mermaid
graph LR
    subgraph Niwue ["Niwue (this repo)"]
        Frontend["Frontend\nReact 19 · TypeScript\nlocalhost:5174"]
        Backend["Backend\nFastAPI\nlocalhost:8002"]
    end

    subgraph External
        FuturaFix["FuturaFix\nData Engine\nlocalhost:8001"]
        Mollie["Mollie\nPayments"]
        Resend["Resend\nEmail"]
    end

    Frontend -->|search & preview| Backend
    Frontend -->|checkout redirect| Mollie
    Backend -->|building data & AI analysis| FuturaFix
    Backend -->|create payment| Mollie
    Mollie -->|webhook| Backend
    Backend -->|email PDF| Resend
```

---

## 💳 Payment Flow

```mermaid
graph LR
    A["User searches address"] --> B["Preview page\n/rapport/:bagId"]
    B --> C["User enters email\nPOST /payments/create"]
    C --> D["Mollie checkout\nexternal payment page"]
    D --> E["Redirect to\n/rapport/betaling/resultaat"]
    E --> F["Poll GET\n/payments/status/:id"]
    F -->|paid| G["Download PDF\nGET /reports/download/:id"]
    F -->|pending| F
    D -->|async| H["Mollie webhook\nPOST /payments/webhook"]
    H --> Backend["Backend updates\npayment status"]
```

---

## 📁 Project Structure

```mermaid
graph TD
    Root["homebuyers/"]

    Root --> Backend["backend/"]
    Root --> Frontend["frontend/"]

    Backend --> BMain["main.py\nFastAPI · port 8002"]
    Backend --> BConfig["app/config/settings.py\nenv vars"]
    Backend --> BRoutes["app/routes/"]
    Backend --> BServices["app/services/"]
    Backend --> BTemplates["app/templates/report.html\nA4 PDF template Dutch"]

    BRoutes --> R1["public.py\nGET /public/search\nGET /public/preview/:bag_id"]
    BRoutes --> R2["payments.py\nPOST /payments/create\nPOST /payments/webhook"]
    BRoutes --> R3["reports.py\nGET /reports/download/:id"]

    BServices --> S1["payment_service.py\nMollie API calls"]
    BServices --> S2["report_generator.py\nWeasyPrint PDF"]
    BServices --> S3["email_service.py\nResend email"]

    Frontend --> FApp["src/App.tsx\nRouter + QueryClientProvider"]
    Frontend --> FApi["src/api/client.ts\nAxios calls to backend"]
    Frontend --> FPages["src/pages/"]

    FPages --> P1["Home.tsx\nAddress search + hero"]
    FPages --> P2["ReportPreview.tsx\nBuilding preview + checkout"]
    FPages --> P3["PaymentResult.tsx\nSuccess/failure + PDF download"]
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- [FuturaFix](https://github.com/Louai609/futurafix.io) running on port 8001
- Mollie account (test key works for dev)

### 1. Clone & configure

```bash
git clone https://github.com/Louai609/homebuyers.git
cd homebuyers
```

### 2. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn main:app --reload --port 8002
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev   # http://localhost:5174
```

> **macOS note:** WeasyPrint requires system libraries. Run `brew install pango cairo` first.

> **Mollie webhooks locally:** Use [ngrok](https://ngrok.com) — `ngrok http 8002` — and set `MOLLIE_WEBHOOK_URL` to the ngrok URL.

---

## 🔑 Environment Variables

| Variable | Description |
| --- | --- |
| `FUTURAFIX_API_URL` | FuturaFix backend base URL |
| `FUTURAFIX_API_KEY` | API key from FuturaFix `/auth/api-keys` |
| `MOLLIE_API_KEY` | `test_xxxx` for dev, `live_xxxx` for prod |
| `MOLLIE_REDIRECT_URL` | Frontend URL after payment (must include `{id}`) |
| `MOLLIE_WEBHOOK_URL` | Public HTTPS URL — Mollie posts payment status here |
| `REPORT_PRICE_EUR` | Price in euro cents (e.g. `2499` = €24.99) |
| `RESEND_API_KEY` | For emailing the PDF report |
| `EMAIL_FROM` | Sender address |

---

## 🧰 Tech Stack

```mermaid
graph LR
    subgraph Frontend
        React["React 19"]
        TS["TypeScript"]
        Vite["Vite"]
        Tailwind["Tailwind CSS"]
    end

    subgraph Backend
        FastAPI["FastAPI"]
        WeasyPrint["WeasyPrint\nPDF generation"]
        Jinja2["Jinja2\nHTML templates"]
        HTTPX["HTTPX\nFuturaFix client"]
    end

    subgraph Payments
        Mollie["Mollie\niDEAL · credit card"]
    end

    subgraph Email
        Resend["Resend"]
    end

    subgraph DataPlatform ["Data Platform"]
        FuturaFix["FuturaFix\nBAG · AI · KNMI · EP-Online"]
    end

    Frontend -->|REST| Backend
    Backend --> Payments
    Backend --> Email
    Backend --> DataPlatform
```

---

Built with ❤️ for Dutch homebuyers · Powered by [FuturaFix](https://github.com/Louai609/futurafix.io)
