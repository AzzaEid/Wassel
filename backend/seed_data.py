from database import SessionLocal
from models import Merchant, Customer, Order, EscrowAccount, Transaction, Event
from datetime import datetime, timedelta
from uuid import uuid4


def run_seed():
    db = SessionLocal()
    try:
        if db.query(Merchant).count() > 0:
            return

        merchant = Merchant(
            id="merchant-001",
            name="متجر زهرة للملابس",
            phone="+970599001001",
            balance=118.2,
        )
        db.add(merchant)

        c_ahmed = Customer(phone="+970599100001", name="أحمد خالد", total_orders=15, return_count=0)
        c_sara = Customer(phone="+970599100002", name="سارة محمود", total_orders=7, return_count=1)
        c_mohammad = Customer(phone="+970599100003", name="محمد علي", total_orders=0, return_count=0)
        c_khaled = Customer(phone="+970599100004", name="خالد نمر", total_orders=8, return_count=5)

        for c in [c_ahmed, c_sara, c_mohammad, c_khaled]:
            db.add(c)
        db.flush()

        now = datetime.utcnow()

        # Order 1: Ahmed — completed (cod_protected)
        order1 = Order(
            id=str(uuid4()),
            merchant_id="merchant-001",
            customer_id=c_ahmed.id,
            product_name="فستان صيفي",
            total_amount=120.0,
            delivery_address="نابلس، شارع الجامعة",
            strategy="cod_protected",
            deposit_percentage=0,
            deposit_amount=0.0,
            status="completed",
            created_at=now - timedelta(days=3),
            expires_at=now - timedelta(days=3) + timedelta(hours=24),
        )
        db.add(order1)
        db.flush()

        escrow1 = EscrowAccount(
            order_id=order1.id,
            total_held=120.0,
            merchant_share=118.2,
            platform_fee=1.8,
            status="released",
            funded_at=now - timedelta(days=3),
            driver_confirmed_at=now - timedelta(days=2, hours=2),
            released_at=now - timedelta(days=2),
        )
        db.add(escrow1)
        db.add(Event(
            description=f"أحمد خالد — تم إتمام الطلب وإفراج 118.2₪",
            order_id=order1.id,
            timestamp=now - timedelta(days=2),
        ))

        # Order 2: Sara — deposit paid, waiting delivery (funded)
        order2 = Order(
            id=str(uuid4()),
            merchant_id="merchant-001",
            customer_id=c_sara.id,
            product_name="حذاء رياضي",
            total_amount=85.0,
            delivery_address="رام الله، المنارة",
            strategy="deposit",
            deposit_percentage=20,
            deposit_amount=17.0,
            status="deposit_paid",
            created_at=now - timedelta(hours=5),
            expires_at=now - timedelta(hours=5) + timedelta(hours=24),
        )
        db.add(order2)
        db.flush()

        escrow2 = EscrowAccount(
            order_id=order2.id,
            total_held=17.0,
            status="funded",
            funded_at=now - timedelta(hours=4),
            auto_release_at=now - timedelta(hours=4) + timedelta(hours=48),
            card_token=f"mock_tok_{str(uuid4())[:12]}",
        )
        db.add(escrow2)
        db.add(Event(
            description=f"سارة محمود — دفعت عربون 17₪",
            order_id=order2.id,
            timestamp=now - timedelta(hours=4),
        ))

        # Order 3: Khaled — returned (full pay, refused)
        order3 = Order(
            id=str(uuid4()),
            merchant_id="merchant-001",
            customer_id=c_khaled.id,
            product_name="جاكيت شتوي",
            total_amount=200.0,
            delivery_address="الخليل، وسط البلد",
            strategy="full",
            deposit_percentage=100,
            deposit_amount=200.0,
            status="returned",
            created_at=now - timedelta(days=7),
            expires_at=now - timedelta(days=7) + timedelta(hours=24),
        )
        db.add(order3)
        db.flush()

        escrow3 = EscrowAccount(
            order_id=order3.id,
            total_held=0.0,
            status="refunded",
        )
        db.add(escrow3)
        db.add(Event(
            description=f"خالد نمر — رفض الاستلام، تم إعادة 180₪",
            order_id=order3.id,
            timestamp=now - timedelta(days=6),
        ))

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def reset_db():
    db = SessionLocal()
    try:
        db.query(Event).delete()
        db.query(Transaction).delete()
        db.query(EscrowAccount).delete()
        db.query(Order).delete()
        db.query(Customer).delete()
        db.query(Merchant).delete()
        db.commit()
    finally:
        db.close()
    run_seed()
