<div align="center">

<img src="wassel_logo.png" alt="وصّل" width="100" />

# وصّل — Wassel

### Smart Escrow Trust Layer for Arab COD E-Commerce

*"ادفع بأمان. استلم بثقة."*

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

</div>

---

## The Problem

**80% of Arab e-commerce runs on Cash on Delivery.** This creates a broken trust loop that neither side can escape:

| Who | The Pain |
|---|---|
| 🏪 **Merchant** | Ships first, gets paid last. Absorbs 15–20% return rates with zero protection. Waits 7+ days to recover frozen funds. |
| 👤 **Customer** | Binary choice: pay everything upfront with no guarantee, or refuse and kill the merchant's margin. No middle ground. |
| 🚚 **Delivery Company** | Trapped in the middle of every dispute with no neutral arbiter. |

> *Neither side is protected. Everyone loses.*

---

## The Solution

Wassel sits between all parties as a **financial trust layer** — holding funds in secure escrow and releasing them only when everyone is satisfied.

```
Merchant ──── creates order ────► Wassel ◄──── shipment.created (webhook)
                                    │
                              scores customer
                              picks strategy
                              generates link
                                    │
Customer ◄────── payment link ──────┘
    │
    └── pays deposit or full ──► escrow locked
                                      │
                              driver confirms delivery
                                      │
                              customer confirms receipt
                                      │
                              98.5% released to merchant ✓
```

**No more binary choice. No more risk for either side.**

---

## The Intelligence

The core differentiator is Wassel's **Risk Scoring Engine** — every customer gets a personalized payment strategy based on their history. No registration required, just a phone number.

```
Trust Score = 100 − (return_rate × 70) − experience_penalty
```

| Score | Customer Profile | Strategy | What Customer Pays |
|:---:|---|---|---|
| **0** | New customer | Full upfront | 100% before delivery |
| **1–29** | High risk | Full upfront | 100% before delivery |
| **30–59** | Medium | 30% deposit | 30% now + 70% on delivery |
| **60–79** | Good | 20% deposit | 20% now + 80% on delivery |
| **80–100** | Trusted | COD Protected | 0% upfront — all on delivery |

The system computes the score in real time and generates an Arabic explanation of the recommendation automatically.

---

## Two Order Flows

### Manual — Merchant Creates the Order
```
Merchant enters phone → Wassel scores customer → picks strategy
→ generates payment link → customer pays → customer confirms
→ funds released to merchant
```

### Automatic — Delivery Company Webhook
```
POST /webhooks/delivery  { event: "shipment.created", ... }
→ Wassel auto-creates order + payment link
→ customer pays → driver marks delivered
→ customer confirms → funds released
```

The webhook flow requires **dual confirmation** (driver + customer), preventing disputes by design.

---

## Implemented Scenarios

| | Scenario | Status |
|---|---|:---:|
| A | Happy Path — Webhook → Pay → Deliver → Release | ✅ |
| B | Manual Order Creation (Merchant Dashboard) | ✅ |
| C | Customer Full Payment Override | ✅ |
| D | Delivery Refused — Auto Partial Refund | ✅ |
| E | Customer Dispute — Freeze + 70% Refund | ✅ |
| F | 48-Hour Auto-Release (APScheduler) | ✅ |
| G | Merchant Cancellation Before Payment | ✅ |
| H | Payment Link Expiry After 24h | ✅ |

---

## Quick Start

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API → http://localhost:8000
# Docs → http://localhost:8000/docs
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
# App → http://localhost:5173
```

The database seeds automatically on first run: 1 merchant, 4 customers with different risk profiles, and 3 demo orders in various states.

---

## Pages

| Route | Audience | Purpose |
|---|---|---|
| `/` | Anyone | Product landing page |
| `/dashboard` | Merchant | Create orders, view escrow, stats & chart |
| `/pay/:id` | Customer | Mobile-friendly payment flow |
| `/delivery-company` | Delivery company | Submit shipments via webhook |
| `/driver` | Driver | Mark deliveries as delivered or refused |
| `/admin` | Internal | Simulate any event, inspect all orders |

---

## Tech Stack

```
Backend          FastAPI · SQLAlchemy · SQLite · APScheduler
Frontend         React · Vite · TypeScript · Recharts
Risk Engine      Rule-based ML — works from the very first order
Integration      Webhook receiver (shipment.created / delivered / refused)
Deployment       Railway (backend) · Vercel (frontend)
```

---

## Business Model

| Revenue Stream | Detail |
|---|---|
| Transaction fee | **1.5%** per released escrow — already live in `escrow_manager.py` |
| Merchant SaaS | 49₪/month for unlimited orders and priority support |
| API integration | Setup fee for delivery company webhook onboarding |

**Market opportunity:** $20B BNPL in MENA · 80%+ COD penetration · zero smart escrow solutions in the Arab market today.

---

## Project Structure

```
Wassel/
├── backend/
│   ├── main.py                 FastAPI app + APScheduler
│   ├── models.py               6 database tables
│   ├── database.py             SQLite + auto-seed
│   ├── services/
│   │   ├── risk_scorer.py      Trust score formula
│   │   ├── strategy_engine.py  5-tier payment strategy
│   │   ├── escrow_manager.py   State machine + 98.5/1.5% split
│   │   └── mock_gateway.py     Payment gateway stub
│   └── routes/
│       ├── orders.py           Create / list / get / cancel
│       ├── payments.py         Deposit, full pay, charge remaining
│       ├── escrow.py           Confirm, dispute
│       ├── webhooks.py         shipment.created / delivered / refused
│       ├── dashboard.py        Stats + weekly chart
│       ├── scoring.py          Risk lookup + AI insight text
│       └── admin.py            Simulation controls + event feed
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── Dashboard.tsx
        │   ├── PaymentPage.tsx
        │   ├── AdminPanel.tsx
        │   ├── DeliveryCompanyPage.tsx
        │   └── DriverPage.tsx
        ├── components/
        │   ├── FloatingNav.tsx
        │   ├── RiskBadge.tsx
        │   ├── EscrowStatus.tsx
        │   ├── StatsGrid.tsx
        │   ├── StrategyCard.tsx
        │   ├── OrdersTable.tsx
        │   └── PaymentOptions.tsx
        └── lib/
            └── api.ts          Axios client, all endpoints wired
```

---

<div align="center">
<img src="wassel_logo.png" alt="وصّل" width="40" />
<br/>
<strong>وصّل — Wassel</strong><br/>
<sub>طبقة ثقة مالية ذكية للتجارة الإلكترونية العربية</sub>
</div>
