from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from uuid import uuid4

from database import get_db
from models import Merchant, Customer, Order, EscrowAccount, Event
from services.risk_scorer import calculate_risk_score
from services.strategy_engine import get_payment_strategy

router = APIRouter()

FRONTEND_BASE = "http://localhost:5173"


class CreateOrderBody(BaseModel):
    merchant_id: str
    customer_phone: str
    customer_name: Optional[str] = None
    product_name: str
    amount: float
    delivery_address: Optional[str] = None


@router.post("")
def create_order(body: CreateOrderBody, db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter(Merchant.id == body.merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    customer = db.query(Customer).filter(Customer.phone == body.customer_phone).first()
    if not customer:
        customer = Customer(
            phone=body.customer_phone,
            name=body.customer_name or body.customer_phone,
            total_orders=0,
            return_count=0,
        )
        db.add(customer)
        db.flush()

    risk_score = calculate_risk_score(customer)
    strategy_data = get_payment_strategy(risk_score, body.amount)

    now = datetime.utcnow()
    order = Order(
        id=str(uuid4()),
        merchant_id=body.merchant_id,
        customer_id=customer.id,
        product_name=body.product_name,
        total_amount=body.amount,
        delivery_address=body.delivery_address,
        strategy=strategy_data["strategy"],
        deposit_percentage=strategy_data["deposit_percentage"],
        deposit_amount=strategy_data["deposit_amount"],
        status="pending",
        source="manual",
        created_at=now,
        expires_at=now + timedelta(hours=24),
    )
    db.add(order)
    db.flush()

    escrow = EscrowAccount(order_id=order.id, status="empty")
    db.add(escrow)

    db.add(Event(
        description=f"{customer.name} — طلب جديد: {body.product_name} ({body.amount}₪)",
        order_id=order.id,
    ))

    db.commit()

    return {
        "order_id": order.id,
        "strategy": strategy_data["strategy"],
        "deposit_percentage": strategy_data["deposit_percentage"],
        "deposit_amount": strategy_data["deposit_amount"],
        "remaining_amount": strategy_data["remaining_amount"],
        "reasoning": strategy_data["reasoning"],
        "risk_score": risk_score,
        "payment_url": f"{FRONTEND_BASE}/pay/{order.id}",
    }


@router.get("")
def list_orders(merchant_id: str, db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .filter(Order.merchant_id == merchant_id)
        .order_by(Order.created_at.desc())
        .all()
    )
    result = []
    for o in orders:
        escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == o.id).first()
        customer = db.query(Customer).filter(Customer.id == o.customer_id).first()
        result.append({
            "id": o.id,
            "product_name": o.product_name,
            "customer_name": customer.name if customer else None,
            "customer_phone": customer.phone if customer else None,
            "total_amount": o.total_amount,
            "strategy": o.strategy,
            "deposit_percentage": o.deposit_percentage,
            "order_status": o.status,
            "escrow_status": escrow.status if escrow else None,
            "created_at": o.created_at.isoformat(),
            "can_cancel": escrow.status == "empty" if escrow else False,
        })
    return result


@router.get("/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    merchant = db.query(Merchant).filter(Merchant.id == order.merchant_id).first()

    remaining_secs = 0
    if order.expires_at:
        delta = (order.expires_at - datetime.utcnow()).total_seconds()
        remaining_secs = max(0, int(delta))

    return {
        "id": order.id,
        "product_name": order.product_name,
        "total_amount": order.total_amount,
        "deposit_amount": order.deposit_amount,
        "deposit_percentage": order.deposit_percentage,
        "strategy": order.strategy,
        "order_status": order.status,
        "delivery_address": order.delivery_address,
        "created_at": order.created_at.isoformat(),
        "expires_at": order.expires_at.isoformat() if order.expires_at else None,
        "time_remaining_seconds": remaining_secs,
        "customer_name": customer.name if customer else None,
        "customer_phone": customer.phone if customer else None,
        "merchant_name": merchant.name if merchant else None,
        "escrow_status": escrow.status if escrow else None,
        "total_held": escrow.total_held if escrow else 0,
        "source": order.source,
    }


@router.post("/{order_id}/cancel")
def cancel_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    if not escrow or escrow.status != "empty":
        raise HTTPException(status_code=400, detail="Can only cancel before payment")

    escrow.status = "cancelled"
    order.status = "cancelled"

    db.add(Event(description=f"طلب {order.product_name} — تم الإلغاء", order_id=order_id))
    db.commit()

    return {"order_status": "cancelled", "escrow_status": "cancelled"}
