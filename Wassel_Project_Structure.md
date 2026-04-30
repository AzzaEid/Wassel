# وصّل — هيكلية المشروع وآلية العمل
## الملف النهائي لبدء التنفيذ بـ Claude Code

---

## القرارات التقنية المثبّتة

| القرار | الاختيار |
|--------|---------|
| Repo | Monorepo واحدة |
| Backend | FastAPI (Python 3.11+) |
| Frontend | React.js (Vite + React Router) |
| Database | SQLite + SQLAlchemy |
| Styling | TailwindCSS + shadcn/ui |
| Charts | Recharts |
| HTTP Client | Axios |
| Real-time | Polling كل 5 ثوانٍ |
| Font | IBM Plex Sans Arabic |
| Git | كل شخص branch منفصل + PR → main |
| العملة | شيكل (₪) ثابت |

---

## هيكل الـ Repo الكامل

```
wassel/
│
├── README.md
├── .gitignore
│
├── backend/
│   ├── main.py                     # FastAPI app + CORS + startup
│   ├── database.py                 # SQLAlchemy engine + session
│   ├── models.py                   # ORM models
│   ├── seed_data.py                # بيانات ديمو واقعية
│   ├── requirements.txt
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── orders.py               # CRUD طلبات + إنشاء يدوي
│   │   ├── payments.py             # Mock دفع + card-on-file
│   │   ├── escrow.py               # إدارة Escrow + حالات الخلاف
│   │   ├── scoring.py              # Risk Score lookup
│   │   ├── dashboard.py            # Stats + orders list
│   │   ├── webhooks.py             # استقبال من شركات التوصيل
│   │   └── admin.py                # Demo panel actions + reset
│   │
│   └── services/
│       ├── __init__.py
│       ├── strategy_engine.py      # قلب النظام — اختيار الاستراتيجية
│       ├── risk_scorer.py          # حساب Risk Score
│       ├── mock_gateway.py         # محاكاة بوابة الدفع
│       └── escrow_manager.py       # State machine للـ Escrow
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   │
│   ├── public/
│   │   └── wassel-logo.svg
│   │
│   └── src/
│       ├── main.tsx                 # Entry point
│       ├── App.tsx                  # React Router setup
│       ├── globals.css              # Tailwind + CSS variables
│       │
│       ├── lib/
│       │   └── api.ts               # Axios client → backend
│       │
│       ├── components/
│       │   ├── Layout.tsx            # RTL wrapper + header
│       │   ├── RiskBadge.tsx         # 🟢🟡🔴 badge
│       │   ├── EscrowStatus.tsx      # حالة Escrow بالألوان
│       │   ├── OrdersTable.tsx       # جدول الطلبات
│       │   ├── StrategyCard.tsx      # عرض الاستراتيجية المقترحة
│       │   ├── StatsGrid.tsx         # الـ 5 stats cards
│       │   └── PaymentOptions.tsx    # خيارات الدفع للزبون
│       │
│       └── pages/
│           ├── Dashboard.tsx         # /dashboard — واجهة التاجر
│           ├── PaymentPage.tsx       # /pay/:orderId — صفحة الزبون
│           └── AdminPanel.tsx        # /admin — لوحة تحكم الديمو
│
└── docs/
    ├── scenario.md                   # السيناريو المؤكد (من هذه المحادثة)
    └── api-reference.md              # توثيق الـ API
```

---

## تفصيل كل ملف — ماذا يحتوي

### Backend

#### main.py
```python
# FastAPI app
# CORS middleware → allow localhost:5173 (Vite dev server)
# Include all routers
# On startup: create tables + seed data if empty
```

#### database.py
```python
# SQLAlchemy engine → sqlite:///./wassel.db
# SessionLocal factory
# Base declarative class
# get_db dependency
```

#### models.py
```python
# Merchant: id, name, phone, balance
# Customer: id, phone, name, total_orders, return_count
# Order: id, merchant_id, customer_id, product_name, total_amount,
#         delivery_address, strategy, deposit_percentage, deposit_amount,
#         status, created_at, expires_at (created_at + 24h)
# EscrowAccount: id, order_id, total_held, merchant_share, platform_fee,
#                status, funded_at, auto_release_at, released_at,
#                card_token (mock)
# Transaction: id, order_id, type, amount, created_at
```

#### seed_data.py
```python
# 1 تاجر: متجر زهرة للملابس
# 4 زبائن بدرجات ثقة مختلفة
# 3 طلبات سابقة بحالات مختلفة (completed, funded, refunded)
```

#### routes/orders.py
```python
# POST /api/orders — إنشاء طلب يدوي
#   → يحسب Risk Score → يختار Strategy → ينشئ رابط → يُرجع الكل
# GET  /api/orders/{order_id} — تفاصيل طلب واحد + escrow status
# GET  /api/orders?merchant_id={id} — قائمة طلبات التاجر
# POST /api/orders/{order_id}/cancel — إلغاء (فقط قبل الدفع)
```

#### routes/payments.py
```python
# POST /api/payments/{order_id}/pay — دفع (mock)
#   Body: { payment_type: "deposit" | "full", mock_card: "4242..." }
#   → يُحدث Escrow → يخزن card_token → يُرجع confirmation
# POST /api/payments/{order_id}/charge-remaining — حجز الباقي
#   → يستخدم card_token المخزن → يُحدث Escrow total
```

#### routes/escrow.py
```python
# POST /api/escrow/{order_id}/confirm — زبون يؤكد الاستلام
#   → يفحص: هل السائق أكد؟ → إذا نعم: release. إذا لا: ينتظر.
#   → عند release: يحجز الباقي من البطاقة (إذا عربون) ثم يُحرر
# POST /api/escrow/{order_id}/dispute — زبون يُبلغ عن مشكلة
#   → يخصم تكلفة التوصيل → يُعيد الباقي → frozen
```

#### routes/scoring.py
```python
# GET /api/scoring/{customer_phone}
#   → يرجع: name, risk_score, strategy_recommendation, exists
#   → إذا زبون جديد: score=0, strategy="full"
```

#### routes/dashboard.py
```python
# GET /api/dashboard/{merchant_id}
#   → stats: total_orders, escrow_held, released_this_week,
#            return_rate_percent, returned_count
#   → recent_orders: آخر 20 طلب مع escrow status
```

#### routes/webhooks.py
```python
# POST /webhooks/delivery — من شركات التوصيل
#   event: "shipment.created"
#     → ينشئ Order + يحسب Strategy + يُشعر التاجر
#   event: "shipment.delivered"
#     → escrow.status → "driver_confirmed"
#   event: "shipment.refused"
#     → يخصم تكلفة التوصيل → refund → risk_score ينخفض
```

#### routes/admin.py
```python
# POST /api/admin/simulate/delivered/{order_id} — محاكاة webhook التسليم
# POST /api/admin/simulate/refused/{order_id} — محاكاة webhook الرفض
# POST /api/admin/simulate/48h/{order_id} — تحرير تلقائي فوري
# POST /api/admin/simulate/customer-confirm/{order_id} — محاكاة تأكيد الزبون
# POST /api/admin/reset — إعادة كل البيانات للحالة الأولى
```

#### services/strategy_engine.py
```python
# get_payment_strategy(risk_score, order_value) → dict
# score 0 (جديد بدون تاريخ) → دفع كامل
# score < 30 (خطر عالٍ) → دفع كامل
# score 30-59 → عربون 30%
# score 60-79 → عربون 20%
# score >= 80 → COD محمي
```

#### services/risk_scorer.py
```python
# calculate_risk_score(customer) → float (0-100)
# 100 = موثوق جداً, 0 = جديد أو خطر
# العوامل: return_rate (60%), order_count (20%), آخر طلب ناجح (20%)
# زبون جديد (0 طلبات) → score = 0 → دفع كامل
```

#### services/mock_gateway.py
```python
# create_payment(amount, card_data) → { success, transaction_id, card_token }
# charge_saved_card(card_token, amount) → { success, transaction_id }
# دائماً ينجح في الديمو
```

#### services/escrow_manager.py
```python
# EscrowStateMachine:
#   empty → funded (عند الدفع)
#   funded → driver_confirmed (عند webhook التسليم)
#   funded → refunded (عند webhook الرفض)
#   funded → auto_released (عند 48h timeout)
#   funded → frozen (عند إبلاغ الزبون)
#   driver_confirmed → released (عند تأكيد الزبون)
#   driver_confirmed → frozen (عند إبلاغ الزبون)
#   driver_confirmed → auto_released (عند 48h timeout)
#   funded/driver_confirmed + cancel before pay → cancelled
#   empty + 24h → expired
```

### Frontend

#### src/App.tsx
```tsx
// React Router:
// /dashboard         → Dashboard.tsx
// /pay/:orderId      → PaymentPage.tsx
// /admin             → AdminPanel.tsx
// /                  → redirect to /dashboard
```

#### src/globals.css
```css
/* CSS Variables */
--primary: #1D6B4F;
--primary-light: #E1F5EE;
--amber: #854F0B;
--amber-light: #FAEEDA;
--danger: #A32D2D;
--danger-light: #FCEBEB;
--blue: #185FA5;
--blue-light: #E6F1FB;
--text: #111827;
--text-secondary: #6B7280;
--border: #E5E7EB;
--bg: #FAFAF8;
```

#### src/lib/api.ts
```typescript
// Axios instance → http://localhost:8000
// Functions:
//   getScoring(phone) → risk_score + strategy
//   createOrder(data) → order + payment_url
//   getDashboard(merchantId) → stats + orders
//   processPayment(orderId, type, cardData) → confirmation
//   confirmDelivery(orderId) → escrow release
//   reportIssue(orderId) → escrow frozen
//   getOrderStatus(orderId) → order + escrow (for polling)
//   adminSimulate(orderId, action) → result
//   adminReset() → success
```

#### src/pages/Dashboard.tsx
```
Layout RTL:
  Header: شعار + "مرحباً، متجر زهرة" + رصيد المحفظة
  
  StatsGrid (5 cards):
    إجمالي الطلبات | محجوز Escrow | تم الإفراج | إرجاع % | عدد مرجعة

  إنشاء طلب جديد:
    Input: رقم الهاتف + [تحقق]
    → يظهر: اسم + RiskBadge + الاستراتيجية
    Input: اسم المنتج
    Input: المبلغ (₪)
    Input: العنوان
    Button: [إنشاء رابط الدفع]
    → بعد الإنشاء: يظهر الرابط + [نسخ]

  OrdersTable:
    رقم | اسم | هاتف | منتج | مبلغ | استراتيجية | Escrow | تاريخ | إجراء
    إجراء = [إلغاء] قبل الدفع فقط

  Polling: كل 5 ثوانٍ يستدعي getDashboard → يُحدث stats + orders
```

#### src/pages/PaymentPage.tsx
```
حالة الصفحة تعتمد على Order.status:

إذا "pending" (لم يدفع بعد):
  Card: اسم المتجر + المنتج + المبلغ الكلي
  PaymentOptions:
    إذا الاستراتيجية ليست "full":
      خيار 1: عربون X% — بارز (border أخضر)
      خيار 2: دفع كامل — نفس التنسيق
    إذا الاستراتيجية "full":
      خيار واحد فقط: دفع كامل
  Mock Card Form + [ادفع]

إذا "deposit_paid" أو "fully_paid" (دفع، ينتظر التوصيل):
  ✅ تم الدفع
  رقم الطلب
  المبلغ المدفوع + المتبقي (إذا عربون)
  🔒 محمي في Escrow
  "زر تأكيد الاستلام سيظهر عند وصول طلبك"

إذا "driver_delivered" (السائق أكد التسليم):
  📦 وصل طلبك!
  [✅ تأكيد الاستلام]
  [⚠️ في مشكلة]

إذا "completed" أو "auto_released":
  ✅ شكراً! تم إتمام الطلب

إذا "disputed":
  ⚠️ تم الإبلاغ — تواصل مع المتجر

إذا "refunded":
  ↩️ تم إعادة المبلغ إليك

إذا "cancelled":
  ❌ هذا الطلب تم إلغاؤه

إذا "expired":
  ⏰ انتهت صلاحية هذا الرابط

Polling: كل 5 ثوانٍ يستدعي getOrderStatus → يُحدث حالة الصفحة
```

#### src/pages/AdminPanel.tsx
```
العنوان: لوحة تحكم الديمو

Dropdown: اختر طلباً [قائمة الطلبات الحالية مع الحالة]

أزرار الأحداث:
  [📦 السائق سلّم الطرد] → simulate/delivered
  [❌ الزبون رفض الاستلام] → simulate/refused
  [✅ الزبون أكد الاستلام] → simulate/customer-confirm
  [⏰ 48h انتهت] → simulate/48h
  [🔄 Reset كل البيانات] → admin/reset

كل زر يعرض نتيجة: "✅ تم" أو "❌ خطأ: ..."

آخر 10 أحداث (polling كل 3 ثوانٍ)
```

---

## آلية العمل — توزيع المهام على الفريق

### Branches

```
main              ← production-ready فقط
├── azza/backend-core      ← عزة: FastAPI + models + strategy + escrow
├── shahd/backend-data     ← شهد: scoring + seed data + webhooks + mock gateway
└── mona/frontend          ← منة: كل الـ frontend
```

### قواعد الـ PR

```
1. كل PR يجب أن يعمل بدون كسر main
2. PR صغير ومركز — لا PRs ضخمة
3. مراجعة سريعة (5 دقائق) ثم merge
4. الهاكاثون ليس production — السرعة أهم من الكمال
```

### جدول العمل المقترح

```
يوم 1 (25 أبريل):
  عزة: main.py + database.py + models.py + routes/orders.py
  شهد: seed_data.py + services/risk_scorer.py + routes/scoring.py
  منة: Vite setup + tailwind + globals.css + App.tsx + Layout

يوم 2 (26 أبريل):
  عزة: services/strategy_engine.py + services/escrow_manager.py + routes/escrow.py
  شهد: services/mock_gateway.py + routes/payments.py + routes/webhooks.py
  منة: Dashboard.tsx + StatsGrid + OrdersTable + RiskBadge + api.ts

يوم 3 (27 أبريل) ⚠ تسليم الفكرة:
  عزة: routes/dashboard.py + ربط كل الـ endpoints
  شهد: routes/admin.py + اختبار flow كامل backend
  منة: PaymentPage.tsx + PaymentOptions + EscrowStatus
  الكل: تسليم طلب الفكرة

يوم 4 (28 أبريل) ⚠ فيديو 60 ثانية:
  عزة: Bug fixes + تحسين الـ flow
  شهد: Demo data مقنعة + اختبار كل السيناريوهات
  منة: AdminPanel.tsx + تجميل UI
  الكل بعد الظهر: تسجيل فيديو 60 ثانية

يوم 5 (29 أبريل):
  الكل: Bug fixes + تحسينات + فيديو تقدم 2 دقيقة

يوم 6 (30 أبريل):
  الكل: تلميع نهائي + slides + فيديو تقدم

يوم 7 (1 مايو) ⚠ تسليم نهائي:
  الكل: README + GitHub public + فيديو 5 دقائق + تسليم
```

---

## أوامر التشغيل المحلي

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### requirements.txt
```
fastapi==0.115.0
uvicorn==0.30.0
sqlalchemy==2.0.35
pydantic==2.9.0
```

### package.json (dependencies)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "axios": "^1.7.0",
    "recharts": "^2.12.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

---

## .gitignore
```
# Python
__pycache__/
*.pyc
venv/
*.db

# Node
node_modules/
dist/
.env

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
```

---

## README.md — هيكل مقترح

```markdown
# وصّل — Wassel
Smart Payment Trust Layer for Arab E-Commerce

## المشكلة
80%+ من التجارة الإلكترونية العربية تعتمد على COD...

## الحل
طبقة ثقة ذكية تحلل كل معاملة وتقرر استراتيجية الدفع المثلى...

## التشغيل
### Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

### Frontend
cd frontend && npm install && npm run dev

## Tech Stack
FastAPI · React (Vite) · SQLite · TailwindCSS

## الفريق
عزة · شهد · منة — SalamHack 2026
```

---

## ملفات يجب إنشاؤها أولاً (بالترتيب)

للبدء مع Claude Code، الملفات تُنشأ بهذا الترتيب:

```
1. wassel/.gitignore
2. wassel/README.md
3. wassel/backend/requirements.txt
4. wassel/backend/database.py
5. wassel/backend/models.py
6. wassel/backend/seed_data.py
7. wassel/backend/main.py
8. wassel/backend/services/risk_scorer.py
9. wassel/backend/services/strategy_engine.py
10. wassel/backend/services/mock_gateway.py
11. wassel/backend/services/escrow_manager.py
12. wassel/backend/routes/scoring.py
13. wassel/backend/routes/orders.py
14. wassel/backend/routes/payments.py
15. wassel/backend/routes/escrow.py
16. wassel/backend/routes/dashboard.py
17. wassel/backend/routes/webhooks.py
18. wassel/backend/routes/admin.py
19. wassel/frontend/package.json
20. wassel/frontend/vite.config.ts
21. wassel/frontend/tailwind.config.ts
22. wassel/frontend/tsconfig.json
23. wassel/frontend/index.html
24. wassel/frontend/src/globals.css
25. wassel/frontend/src/main.tsx
26. wassel/frontend/src/App.tsx
27. wassel/frontend/src/lib/api.ts
28. wassel/frontend/src/components/ (كل المكونات)
29. wassel/frontend/src/pages/Dashboard.tsx
30. wassel/frontend/src/pages/PaymentPage.tsx
31. wassel/frontend/src/pages/AdminPanel.tsx
```

---

## الـ Prompt لبدء Claude Code

انسخي الـ Technical Prompt v2 (الملف المحدّث) + هذا الملف معاً في المحادثة الجديدة، ثم ابدأي بـ:

"ابدأ ببناء الملفات 1-7 (من .gitignore حتى main.py). أريد أن يعمل `uvicorn main:app --reload` ويُرجع seed data على GET /api/dashboard/merchant-001."
