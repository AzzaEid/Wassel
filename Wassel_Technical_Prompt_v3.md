# Wassel — Technical Kickoff Prompt v3
## النسخة المحدّثة — متوافقة مع السيناريو المؤكد

---

## السياق

أنا مهندسة backend وoptimization. أعمل مع فريق من ثلاثة على بروتوتايب هاكاثون (SalamHack 2026) مدته 6 أيام ينتهي 1 مايو 2026.

**الـ Deadlines الحرجة:**
- **27 أبريل** — تسليم طلب الفكرة (استبعاد إذا فاتت)
- **28 أبريل** — فيديو بروتوتايب 60 ثانية (استبعاد إذا فاتت)
- **1 مايو** — GitHub public + فيديو 5 دقائق

---

## المشروع — وصّل (Wassel)

**الفكرة:** طبقة ثقة مالية ذكية (Smart Payment Trust Layer) تحل مشكلة الدفع عند الاستلام (COD) السائدة في التجارة الإلكترونية العربية.

**المشكلة الجذرية:** الخيار المتاح ثنائي قسري — إما "ادفع الكل" أو "لا تدفع شيئاً". لا يوجد وسط يبني الثقة تدريجياً. النتيجة: 10-20% من الطرود ترجع، التاجر ينتظر أسبوعين لفلوسه، المندوب يحمل نقوداً.

**الحل:** وصّل تحلل كل معاملة وتقترح استراتيجية الدفع المثلى تلقائياً. المبلغ يُحجز في Escrow ولا يُحرر حتى يتم تأكيد مزدوج.

---

## الـ Actors الثلاثة

| Actor | الدور | نقطة التفاعل |
|-------|-------|--------------|
| **التاجر** | ينشئ الطلبات ويتابع المال | Dashboard وصّل |
| **الزبون** | يدفع ويؤكد الاستلام | رابط واحد طوال العملية |
| **شركة التوصيل** | تُسلّم وتُبلّغ عن الحالة | Webhook ثنائي الاتجاه |

---

## القرارات المثبّتة — يجب الالتزام بها بالكامل

| الموضوع | القرار |
|---------|--------|
| إنشاء الطلب — طريقتان | **يدوي (source=manual):** التاجر ينشئ مباشرة على Dashboard وصّل — لا شركة توصيل، الزبون يؤكد الاستلام فور دفعه. **تلقائي (source=webhook):** التاجر يسجّل عند شركة التوصيل، Webhook يُنشئ الطلب تلقائياً — يتطلب تأكيداً مزدوجاً (سائق + زبون) |
| بيانات الطلب | هاتف الزبون + اسمه (إلزامي للطلب اليدوي) + اسم المنتج + المبلغ (₪ ثابت) + عنوان التوصيل + created_at |
| Risk Score | يظهر فقط بعد زر "تحقق" — القرار للنظام لا للتاجر |
| زبون جديد (0 طلبات) | دفع كامل مسبق دائماً بدون استثناء |
| خيار الدفع الكامل للزبون | يظهر **بنفس تنسيق** الخيار الأساسي فقط إذا الاستراتيجية ليست "full" أصلاً |
| رفض الزبون الدفع | يغلق الصفحة — لا إشعار للتاجر |
| انتهاء صلاحية الرابط | 24 ساعة من الإنشاء |
| رابط الزبون | رابط **واحد** طوال العملية — الصفحة تتغير حسب Order.status |
| الباقي عند العربون | يُحجز من نفس البطاقة (card_token) عند تأكيد الاستلام |
| تحرير المال (manual) | تأكيد **مفرد** من الزبون فقط — funded → released مباشرة |
| تحرير المال (webhook) | تأكيد **مزدوج** إلزامي: Webhook السائق → driver_confirmed، ثم تأكيد الزبون → released |
| الرفض (السائق يُبلّغ) | تكلفة التوصيل تُخصم من الزبون — Risk Score ينخفض تلقائياً |
| الخلاف (الزبون يُبلّغ) | Escrow يتجمد + تكلفة توصيل تُخصم + الباقي يُعاد للزبون — الحل خارج وصّل |
| الـ 48 ساعة | تبدأ من لحظة الدفع — لا إشعار — تحرير تلقائي |
| إلغاء الطلب | متاح للتاجر قبل دفع الزبون فقط |
| Real-time | Dashboard يتحدث بـ polling كل 5 ثوانٍ |

---

## Tech Stack المثبّت

| الطبقة | التقنية |
|--------|---------|
| Backend | FastAPI + Uvicorn (Python 3.11+) |
| Database | SQLite + SQLAlchemy (sync) |
| Frontend | React.js (Vite + React Router) + TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| HTTP Client | Axios (frontend → backend) |
| Charts | Recharts |
| Font | IBM Plex Sans Arabic (Google Fonts) |
| Real-time | Polling كل 5 ثوانٍ |
| Git | Branches منفصلة + PR → main |

---

## ما لا نبنيه — قواعد صارمة

- ❌ Authentication (نستخدم `?merchant=merchant-001` في الـ URL)
- ❌ بوابة دفع حقيقية (mock endpoint يُعيد success دائماً)
- ❌ SMS / WhatsApp integration (نُظهر الرابط مباشرة في Dashboard)
- ❌ Error handling شامل (Happy Path فقط)
- ❌ Unit tests
- ❌ Docker

---

## Database Models

```python
# models.py
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from uuid import uuid4

class Merchant(Base):
    __tablename__ = "merchants"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False)
    phone = Column(String)
    balance = Column(Float, default=0.0)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    phone = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    total_orders = Column(Integer, default=0)
    return_count = Column(Integer, default=0)
    # risk_score يُحسب runtime — لا يُخزَّن

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    merchant_id = Column(String, ForeignKey("merchants.id"))
    customer_id = Column(String, ForeignKey("customers.id"))
    product_name = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    delivery_address = Column(String, nullable=True)
    strategy = Column(String)
    # deposit | full | cod_protected
    deposit_percentage = Column(Integer)
    deposit_amount = Column(Float)
    status = Column(String, default="pending")
    source = Column(String, default="manual")
    # "manual"  → created on Wassel dashboard, no delivery company, customer confirms directly
    # "webhook" → created via delivery company webhook, requires driver_confirmed before customer confirm
    # pending → deposit_paid | fully_paid → driver_delivered
    # → completed | disputed | returned | cancelled | expired
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # created_at + 24h

class EscrowAccount(Base):
    __tablename__ = "escrow_accounts"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    order_id = Column(String, ForeignKey("orders.id"), unique=True)
    total_held = Column(Float, default=0.0)
    merchant_share = Column(Float, default=0.0)  # total * 0.985 عند التحرير
    platform_fee = Column(Float, default=0.0)    # total * 0.015 عند التحرير
    status = Column(String, default="empty")
    # empty → funded → driver_confirmed → released | auto_released
    # funded → frozen | refunded | cancelled
    # empty → expired (24h بدون دفع)
    card_token = Column(String, nullable=True)    # mock token للحجز اللاحق
    funded_at = Column(DateTime, nullable=True)
    auto_release_at = Column(DateTime, nullable=True)  # funded_at + 48h
    released_at = Column(DateTime, nullable=True)
    driver_confirmed_at = Column(DateTime, nullable=True)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    order_id = Column(String, ForeignKey("orders.id"))
    type = Column(String)  # deposit | full_payment | remaining | release | refund
    amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## Strategy Engine

```python
# services/strategy_engine.py
# score 0-100: 100 = موثوق جداً، 0 = جديد أو خطر عالٍ

def get_payment_strategy(risk_score: float, order_value: float) -> dict:
    if risk_score == 0:
        # زبون جديد (0 طلبات) — دفع كامل دائماً
        return {
            "strategy": "full",
            "deposit_percentage": 100,
            "deposit_amount": round(order_value, 2),
            "remaining_amount": 0.0,
            "reasoning": "زبون جديد — دفع كامل مسبق مطلوب"
        }
    elif risk_score < 30:
        # خطر عالٍ — دفع كامل
        return {
            "strategy": "full",
            "deposit_percentage": 100,
            "deposit_amount": round(order_value, 2),
            "remaining_amount": 0.0,
            "reasoning": f"تاريخ إرجاعات مرتفع — درجة الثقة: {risk_score}"
        }
    elif risk_score < 60:
        # متوسط — عربون 30%
        pct = 30
        deposit = round(order_value * pct / 100, 2)
        return {
            "strategy": "deposit",
            "deposit_percentage": pct,
            "deposit_amount": deposit,
            "remaining_amount": round(order_value - deposit, 2),
            "reasoning": f"زبون متوسط — عربون {pct}% لتأكيد الجدية"
        }
    elif risk_score < 80:
        # جيد — عربون 20%
        pct = 20
        deposit = round(order_value * pct / 100, 2)
        return {
            "strategy": "deposit",
            "deposit_percentage": pct,
            "deposit_amount": deposit,
            "remaining_amount": round(order_value - deposit, 2),
            "reasoning": f"زبون جيد — عربون {pct}% كافٍ"
        }
    else:
        # موثوق جداً — COD محمي
        return {
            "strategy": "cod_protected",
            "deposit_percentage": 0,
            "deposit_amount": 0.0,
            "remaining_amount": round(order_value, 2),
            "reasoning": f"زبون موثوق — درجة الثقة: {risk_score}"
        }
```

---

## Risk Scorer

```python
# services/risk_scorer.py
# زبون جديد (0 طلبات) → score = 0 ← يؤدي لدفع كامل دائماً

def calculate_risk_score(customer) -> float:
    if customer.total_orders == 0:
        return 0.0  # جديد — لا تاريخ

    return_rate = customer.return_count / customer.total_orders
    score = 100.0
    score -= return_rate * 70      # معدل الإرجاع: وزن 70%
    score -= max(0, (5 - customer.total_orders)) * 2  # قلة الخبرة: وزن 10%
    return round(max(0.0, min(100.0, score)), 1)
```

---

## Escrow State Machine

```python
# services/escrow_manager.py

VALID_TRANSITIONS = {
    "empty": ["funded", "cancelled", "expired"],
    "funded": ["driver_confirmed", "frozen", "refunded", "auto_released"],
    "driver_confirmed": ["released", "frozen", "auto_released"],
    "released": [],       # نهائية
    "auto_released": [],  # نهائية
    "frozen": ["refunded"],
    "refunded": [],       # نهائية
    "cancelled": [],      # نهائية
    "expired": [],        # نهائية
}

def transition(escrow, new_status, db):
    if new_status not in VALID_TRANSITIONS[escrow.status]:
        raise ValueError(f"Invalid transition: {escrow.status} → {new_status}")
    escrow.status = new_status
    # منطق إضافي حسب الحالة الجديدة
    if new_status in ("released", "auto_released"):
        escrow.released_at = datetime.utcnow()
        escrow.merchant_share = round(escrow.total_held * 0.985, 2)
        escrow.platform_fee = round(escrow.total_held * 0.015, 2)
        # يضيف merchant_share لرصيد التاجر
    if new_status == "driver_confirmed":
        escrow.driver_confirmed_at = datetime.utcnow()
    db.commit()
```

---

## API Endpoints الكاملة

```
# Orders
POST /api/orders
  Body: { merchant_id, customer_phone, customer_name?, product_name, amount, delivery_address }
  → يحسب Risk Score → يختار Strategy → ينشئ Order + EscrowAccount (empty)
  → يحسب expires_at = now() + 24h
  Returns: { order_id, strategy, payment_url, risk_score }

GET  /api/orders/{order_id}
  Returns: { order, escrow_status, customer_name, time_remaining_seconds }

GET  /api/orders?merchant_id={id}
  Returns: [ orders list مع escrow_status لكل طلب ]

POST /api/orders/{order_id}/cancel
  → فقط إذا escrow.status == "empty"
  → escrow → "cancelled", order → "cancelled"

# Scoring
GET /api/scoring/{customer_phone}
  Returns: { customer_name, risk_score, strategy_recommendation, exists: bool }
  → إذا exists=false: score=0, strategy="full", customer_name=null

# Payments (Mock)
POST /api/payments/{order_id}/pay
  Body: { payment_type: "deposit" | "full", mock_card: "4242424242424242" }
  → دائماً ينجح
  → يُحدث EscrowAccount: empty → funded
  → يخزن card_token (mock UUID)
  → يحسب auto_release_at = now() + 48h
  → إذا payment_type="full": total_held = order.total_amount
  → إذا "deposit": total_held = order.deposit_amount
  Returns: { escrow_status: "funded", amount_paid, order_status }

POST /api/payments/{order_id}/charge-remaining
  → يُستدعى عند تأكيد الاستلام إذا strategy="deposit"
  → يستخدم card_token المخزن
  → يُضيف الباقي لـ total_held
  Returns: { success, amount_charged }

# Escrow
POST /api/escrow/{order_id}/customer-confirm
  → فقط إذا escrow.status == "driver_confirmed"
  → إذا strategy="deposit": يستدعي charge-remaining أولاً
  → escrow → "released"
  → merchant.balance += merchant_share
  → customer.total_orders += 1
  Returns: { escrow_status: "released", merchant_credited }

POST /api/escrow/{order_id}/dispute
  → فقط إذا escrow.status في ("funded", "driver_confirmed")
  → يخصم تكلفة التوصيل (20₪ ثابتة للديمو)
  → يُعيد الباقي للزبون (mock)
  → escrow → "frozen"
  → order → "disputed"
  Returns: { escrow_status: "frozen", refunded_amount }

# Webhooks — من شركة التوصيل
POST /webhooks/delivery
  Body حسب الـ event:

  event: "shipment.created"
    { merchant_id, customer_phone, customer_name, product_name, total_amount, delivery_address }
    → ينشئ Order + EscrowAccount تلقائياً (نفس POST /api/orders)
    → يُشعر التاجر (يظهر في Dashboard)
    Returns: { order_id, payment_url }

  event: "shipment.delivered"
    { order_id }
    → escrow: funded → driver_confirmed
    → order → "driver_delivered"
    → صفحة الزبون تتحدث (polling يلتقطها)
    Returns: { status: "driver_confirmed" }

  event: "shipment.refused"
    { order_id }
    → يخصم تكلفة التوصيل (20₪)
    → يُعيد الباقي للزبون
    → escrow → "refunded"
    → order → "returned"
    → customer.return_count += 1 (Risk Score سيُعاد حسابه)
    Returns: { status: "refunded", refunded_amount }

# Dashboard
GET /api/dashboard/{merchant_id}
  Returns: {
    merchant: { name, balance },
    stats: {
      total_orders,
      escrow_held,           # مجموع total_held حيث status="funded"|"driver_confirmed"
      released_this_week,    # مجموع merchant_share حيث released_at > أسبوع
      return_rate_percent,   # returned / total * 100
      returned_count
    },
    orders: [
      {
        id, product_name, customer_name, customer_phone,
        total_amount, strategy, deposit_percentage,
        order_status, escrow_status, created_at,
        can_cancel  # true فقط إذا escrow.status == "empty"
      }
    ]
  }

# Admin — للديمو فقط
POST /api/admin/simulate/delivered/{order_id}
  → يحاكي webhook "shipment.delivered"

POST /api/admin/simulate/refused/{order_id}
  → يحاكي webhook "shipment.refused"

POST /api/admin/simulate/customer-confirm/{order_id}
  → يحاكي POST /api/escrow/{id}/customer-confirm

POST /api/admin/simulate/48h/{order_id}
  → تحرير فوري (يتجاوز الـ 48h)
  → إذا strategy="deposit": يحجز الباقي أولاً
  → escrow → "auto_released"
  → merchant.balance += merchant_share

POST /api/admin/reset
  → يحذف كل البيانات ويُعيد الـ seed data
  Returns: { status: "reset complete" }

GET /api/admin/events
  → آخر 20 حدث في النظام (للـ live feed في Admin Panel)
  Returns: [{ timestamp, description, order_id }]
```

---

## Seed Data

```python
# seed_data.py

MERCHANTS = [
    {
        "id": "merchant-001",
        "name": "متجر زهرة للملابس",
        "phone": "+970599001001",
        "balance": 0.0
    }
]

CUSTOMERS = [
    # أحمد: 15 طلب، 0 إرجاع → score ~100 → COD محمي
    {"phone": "+970599100001", "name": "أحمد خالد", "total_orders": 15, "return_count": 0},
    # سارة: 7 طلبات، 1 إرجاع → score ~72 → عربون 20%
    {"phone": "+970599100002", "name": "سارة محمود", "total_orders": 7, "return_count": 1},
    # محمد: 0 طلبات → score = 0 → دفع كامل (زبون جديد)
    {"phone": "+970599100003", "name": "محمد علي", "total_orders": 0, "return_count": 0},
    # خالد: 8 طلبات، 5 إرجاعات → score ~13 → دفع كامل (خطر عالٍ)
    {"phone": "+970599100004", "name": "خالد نمر", "total_orders": 8, "return_count": 5},
]

# طلبات جاهزة تظهر في Dashboard من أول تحميل
EXISTING_ORDERS = [
    {
        # أحمد — مكتمل
        "merchant_id": "merchant-001",
        "customer_phone": "+970599100001",
        "product_name": "فستان صيفي",
        "total_amount": 120.0,
        "delivery_address": "نابلس، شارع الجامعة",
        "strategy": "cod_protected",
        "deposit_percentage": 0,
        "deposit_amount": 0.0,
        "order_status": "completed",
        "escrow_status": "released",
        "merchant_share": 118.2,
    },
    {
        # سارة — محجوز (في انتظار التوصيل)
        "merchant_id": "merchant-001",
        "customer_phone": "+970599100002",
        "product_name": "حذاء رياضي",
        "total_amount": 85.0,
        "delivery_address": "رام الله، المنارة",
        "strategy": "deposit",
        "deposit_percentage": 20,
        "deposit_amount": 17.0,
        "order_status": "deposit_paid",
        "escrow_status": "funded",
    },
    {
        # خالد — مرجع
        "merchant_id": "merchant-001",
        "customer_phone": "+970599100004",
        "product_name": "جاكيت شتوي",
        "total_amount": 200.0,
        "delivery_address": "الخليل، وسط البلد",
        "strategy": "full",
        "deposit_percentage": 100,
        "deposit_amount": 200.0,
        "order_status": "returned",
        "escrow_status": "refunded",
    },
]
```

---

## صفحات Frontend

### /dashboard — Merchant Dashboard

```
Layout: dir="rtl" + IBM Plex Sans Arabic

Header:
  شعار وصّل (دائرة خضراء #1D6B4F + نص)
  "مرحباً، متجر زهرة" | رصيد المحفظة: [balance] ₪

StatsGrid (5 cards):
  إجمالي الطلبات | محجوز في Escrow (₪) | تم الإفراج هذا الأسبوع (₪) | معدل الإرجاع (%) | عدد المرجعة

قسم إنشاء طلب جديد:
  [رقم هاتف الزبون] + [تحقق]  ← زر منفصل
  بعد التحقق: اسم الزبون + RiskBadge + الاستراتيجية المقترحة
  [اسم المنتج] [المبلغ ₪] [عنوان التوصيل]
  [إنشاء رابط الدفع]
  بعد الإنشاء: رابط الدفع + [نسخ الرابط]

OrdersTable — أعمدة:
  رقم الطلب | اسم الزبون | رقم الهاتف | المنتج | المبلغ | الاستراتيجية | حالة Escrow | التاريخ | إجراء
  إجراء = [إلغاء] فقط إذا can_cancel=true

Polling: كل 5 ثوانٍ → GET /api/dashboard/merchant-001
```

### /pay/:orderId — Customer Payment Page

```
صفحة واحدة — حالتها تتغير حسب Order.status + Escrow.status

الحالة: "pending" (لم يدفع)
  Card: اسم المتجر + المنتج + المبلغ الكلي
  خيارات الدفع:
    إذا strategy ≠ "full":
      خيار 1 (افتراضي، border أخضر):
        عربون [X]%
        [deposit_amount] ₪ الآن
        + [remaining_amount] ₪ عند الاستلام
      خيار 2 (نفس التنسيق):
        دفع كامل
        [total_amount] ₪ الآن
        🔒 كامل في Escrow
    إذا strategy = "full":
      خيار واحد فقط: دفع كامل [total_amount] ₪
  Mock Card Form:
    [    ] [    ] [    ] [    ]  ← 4242 4242 4242 4242
    MM/YY: 12/28 | CVV: 123
    [ادفع [amount] ₪ الآن]
  🔒 مبلغك محمي — يُعاد إليك إذا لم يصل طلبك

الحالة: "deposit_paid" | "fully_paid" (دفع، ينتظر)
  ✅ تم الدفع — رقم الطلب: [id]
  دفعت: [amount] ₪
  المتبقي: [remaining] ₪ عند الاستلام (إذا عربون)
  🔒 مبلغك محمي في Escrow
  "زر تأكيد الاستلام سيظهر عند وصول طلبك"

الحالة: "driver_delivered" (السائق أكد)
  📦 وصل طلبك!
  هل كل شيء مطابق؟
  [✅ تأكيد الاستلام] → POST /api/escrow/{id}/customer-confirm
  [⚠️ في مشكلة] → POST /api/escrow/{id}/dispute

الحالة: "completed" | escrow "released" | "auto_released"
  ✅ شكراً! تم إتمام الطلب بنجاح 🎉

الحالة: "disputed" | escrow "frozen"
  ⚠️ تم الإبلاغ عن مشكلة
  تم إعادة مبلغك. تواصل مع المتجر.

الحالة: "returned" | escrow "refunded"
  ↩️ تم إعادة المبلغ إليك

الحالة: "cancelled"
  ❌ هذا الطلب تم إلغاؤه. تواصل مع التاجر.

الحالة: "expired"
  ⏰ انتهت صلاحية هذا الرابط (24h). تواصل مع المتجر لرابط جديد.

Polling: كل 5 ثوانٍ → GET /api/orders/{orderId}
```

### /admin — Demo Control Panel

```
العنوان: لوحة تحكم الديمو

Dropdown: اختر طلباً [order_id — product_name — escrow_status]

أزرار الأحداث:
  [📦 السائق سلّم]         → POST /api/admin/simulate/delivered/{id}
  [❌ الزبون رفض]          → POST /api/admin/simulate/refused/{id}
  [✅ الزبون أكد]          → POST /api/admin/simulate/customer-confirm/{id}
  [⏰ 48h انتهت]           → POST /api/admin/simulate/48h/{id}
  [🔄 Reset البيانات]      → POST /api/admin/reset

كل زر يعرض نتيجة فورية: "✅ تم" أو "❌ [خطأ]"

Live Events Feed (polling كل 3 ثوانٍ):
  → GET /api/admin/events
  [14:32] ✅ أحمد خالد — تم الإفراج 118.2₪
  [14:28] 🔒 سارة محمود — دفعت عربون 17₪
```

---

## CSS Variables

```css
:root {
  --primary: #1D6B4F;
  --primary-light: #E1F5EE;
  --primary-dark: #0D4A36;
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
}
```

---

## main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import orders, payments, escrow, dashboard, scoring, webhooks, admin
from seed_data import run_seed

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wassel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(escrow.router, prefix="/api/escrow", tags=["escrow"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["scoring"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.on_event("startup")
def startup():
    run_seed()

@app.get("/")
def root():
    return {"status": "Wassel API running ✅"}
```

---

## requirements.txt

```
fastapi==0.115.0
uvicorn==0.30.0
sqlalchemy==2.0.35
pydantic==2.9.0
python-dateutil==2.9.0
```

---

## سيناريو الديمو — 60 ثانية

```
0-10s:  نفتح /dashboard
        → نُظهر 3 طلبات: مكتمل ✅ + محجوز 🔒 + مرجع ↩️

10-25s: قسم إنشاء طلب
        → ندخل +970599100003 (محمد) → [تحقق]
        → يظهر: 🔴 "زبون جديد — دفع كامل مطلوب"
        → ندخل "حذاء رياضي" + 150₪ + العنوان → [إنشاء رابط]
        → يظهر الرابط: wassel.app/pay/ORD-XXXX

25-40s: نفتح صفحة الدفع (mobile view)
        → نشوف: "ادفع 150₪ كاملاً" (زبون جديد → دفع كامل)
        → ندخل mock card → [ادفع 150₪]
        → ✅ "تم الدفع — مبلغك محمي في Escrow 🔒"

40-52s: نعود للـ Dashboard
        → الطلب الجديد: "🔒 محجوز — 150₪"
        → نفتح /admin → نختار الطلب → [📦 السائق سلّم]
        → صفحة الزبون تتحدث: [✅ تأكيد الاستلام]
        → من /admin نضغط [✅ الزبون أكد]
        → Dashboard: "✅ مكتمل — وصلك 147.75₪"

52-60s: نُظهر Stats المحدّثة
        → رصيد المحفظة ارتفع
        → "هكذا وصّل تحول COD من مخاطرة إلى ضمان"
```

---

## أولويات البناء — بالترتيب الصارم

```
المرحلة 1 — Backend أساسي:
1. main.py + database.py + models.py
2. seed_data.py (تشغيل عند الـ startup)
3. services/risk_scorer.py + strategy_engine.py
4. services/mock_gateway.py + escrow_manager.py
5. routes/scoring.py
6. routes/orders.py (POST + GET)
7. routes/payments.py
8. routes/escrow.py (customer-confirm + dispute)
9. routes/dashboard.py
10. routes/webhooks.py
11. routes/admin.py

المرحلة 2 — Frontend:
12. Vite setup + tailwind + globals.css + App.tsx
13. lib/api.ts
14. components: RiskBadge + EscrowStatus + StatsGrid + OrdersTable + StrategyCard
15. pages/Dashboard.tsx
16. pages/PaymentPage.tsx (كل الحالات)
17. pages/AdminPanel.tsx
```

---

**ابدأ الآن:**
أنشئ هيكل الـ repo كاملاً ثم ابدأ بالمرحلة 1 بالترتيب. الهدف الأول: يعمل `uvicorn main:app --reload` ويُرجع seed data صحيحة على `GET /api/dashboard/merchant-001`.
