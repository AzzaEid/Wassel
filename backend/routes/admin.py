from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import Order, EscrowAccount, Customer, Merchant, Transaction, Event
from services.escrow_manager import transition
from services.mock_gateway import charge_saved_card
from seed_data import reset_db

router = APIRouter()

DELIVERY_COST = 20.0


@router.post("/simulate/delivered/{order_id}")
def sim_delivered(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    if escrow.status != "funded":
        raise HTTPException(status_code=400, detail=f"Escrow not funded (status: {escrow.status})")

    transition(escrow, "driver_confirmed", db)
    order.status = "driver_delivered"

    db.add(Event(description=f"[Sim] السائق سلّم طلب {order.product_name}", order_id=order_id))
    db.commit()

    return {"status": "driver_confirmed", "order_status": "driver_delivered"}


@router.post("/simulate/refused/{order_id}")
def sim_refused(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    if escrow.status not in ("funded", "driver_confirmed"):
        raise HTTPException(status_code=400, detail=f"Cannot refuse (status: {escrow.status})")

    refunded = max(0.0, round(escrow.total_held - DELIVERY_COST, 2))
    transition(escrow, "refunded", db)
    order.status = "returned"

    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    customer.return_count += 1

    db.add(Transaction(order_id=order_id, type="refund", amount=refunded))
    db.add(Event(
        description=f"[Sim] {customer.name} رفض الاستلام، أُعيد {refunded}₪",
        order_id=order_id,
    ))
    db.commit()

    return {"status": "refunded", "refunded_amount": refunded}


@router.post("/simulate/customer-confirm/{order_id}")
def sim_customer_confirm(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    if not escrow or escrow.status != "driver_confirmed":
        raise HTTPException(status_code=400, detail=f"Driver not confirmed yet (status: {escrow.status if escrow else 'none'})")

    if order.strategy == "deposit":
        remaining = round(order.total_amount - order.deposit_amount, 2)
        charge_saved_card(escrow.card_token, remaining)
        escrow.total_held = round(escrow.total_held + remaining, 2)
        db.add(Transaction(order_id=order_id, type="remaining", amount=remaining))
        db.flush()

    transition(escrow, "released", db)

    merchant = db.query(Merchant).filter(Merchant.id == order.merchant_id).first()
    merchant.balance = round(merchant.balance + escrow.merchant_share, 2)

    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    customer.total_orders += 1
    order.status = "completed"

    db.add(Event(
        description=f"[Sim] {customer.name} أكد الاستلام، أُفرج {escrow.merchant_share}₪",
        order_id=order_id,
    ))
    db.commit()

    return {
        "escrow_status": "released",
        "merchant_credited": escrow.merchant_share,
        "order_status": "completed",
    }


@router.post("/simulate/48h/{order_id}")
def sim_48h(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    if not escrow or escrow.status not in ("funded", "driver_confirmed"):
        raise HTTPException(status_code=400, detail=f"Cannot auto-release (status: {escrow.status if escrow else 'none'})")

    if order.strategy == "deposit" and escrow.status == "funded":
        remaining = round(order.total_amount - order.deposit_amount, 2)
        if escrow.card_token:
            charge_saved_card(escrow.card_token, remaining)
            escrow.total_held = round(escrow.total_held + remaining, 2)
            db.add(Transaction(order_id=order_id, type="remaining", amount=remaining))
            db.flush()

    transition(escrow, "auto_released", db)

    merchant = db.query(Merchant).filter(Merchant.id == order.merchant_id).first()
    merchant.balance = round(merchant.balance + escrow.merchant_share, 2)
    order.status = "completed"

    db.add(Event(
        description=f"[Sim] تحرير تلقائي 48h — أُفرج {escrow.merchant_share}₪ للتاجر",
        order_id=order_id,
    ))
    db.commit()

    return {
        "escrow_status": "auto_released",
        "merchant_credited": escrow.merchant_share,
        "order_status": "completed",
    }


@router.post("/reset")
def admin_reset():
    reset_db()
    return {"status": "reset complete"}


@router.get("/events")
def get_events(db: Session = Depends(get_db)):
    events = (
        db.query(Event)
        .order_by(Event.timestamp.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat(),
            "description": e.description,
            "order_id": e.order_id,
        }
        for e in events
    ]
