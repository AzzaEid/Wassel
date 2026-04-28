from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import orders, payments, escrow, dashboard, scoring, webhooks, admin
from seed_data import run_seed

Base.metadata.create_all(bind=engine)

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


@app.get("/")
def root():
    return {"status": "Wassel API running ✅"}


@app.get("/api/health")
def health():
    return {"ok": True}
