from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from database import engine, Base, SessionLocal
from routes import orders, payments, escrow, dashboard, scoring, webhooks, admin
from seed_data import run_seed
from models import Order, EscrowAccount, Merchant, Event
from services.escrow_manager import transition

Base.metadata.create_all(bind=engine)


def run_scheduled_jobs():
    db = SessionLocal()
    try:
        now = datetime.utcnow()

        # 48h auto-release: funded escrows past their auto_release_at
        funded_escrows = db.query(EscrowAccount).filter(
            EscrowAccount.status == "funded",
            EscrowAccount.auto_release_at != None,
            EscrowAccount.auto_release_at <= now,
        ).all()
        for esc in funded_escrows:
            order = db.query(Order).filter(Order.id == esc.order_id).first()
            if not order:
                continue
            transition(esc, "auto_released", db)
            merchant = db.query(Merchant).filter(Merchant.id == order.merchant_id).first()
            if merchant:
                merchant.balance = round(merchant.balance + esc.merchant_share, 2)
            order.status = "completed"
            db.add(Event(
                description=f"تحرير تلقائي بعد 48 ساعة — {order.product_name}",
                order_id=order.id,
            ))
            db.commit()

        # 24h link expiry: pending orders past their expires_at with empty escrow
        expired_orders = db.query(Order).filter(
            Order.status == "pending",
            Order.expires_at != None,
            Order.expires_at <= now,
        ).all()
        for order in expired_orders:
            esc = db.query(EscrowAccount).filter(EscrowAccount.order_id == order.id).first()
            if esc and esc.status == "empty":
                transition(esc, "expired", db)
                order.status = "expired"
                db.add(Event(
                    description=f"انتهت صلاحية رابط الطلب — {order.product_name}",
                    order_id=order.id,
                ))
                db.commit()
    finally:
        db.close()


scheduler = BackgroundScheduler()
scheduler.add_job(run_scheduled_jobs, "interval", minutes=1)

app = FastAPI(title="Wassel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(escrow.router, prefix="/api/escrow", tags=["escrow"])
app.include_router(
    dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["scoring"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.on_event("startup")
def startup():
    run_seed()
    scheduler.start()


@app.get("/")
def root():
    return {"status": "Wassel API running ✅"}


@app.get("/api/health")
def health():
    return {"ok": True}
