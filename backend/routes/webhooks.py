from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from uuid import uuid4

from database import get_db
from models import Customer, Order, EscrowAccount, Transaction, Event
from services.risk_scorer import calculate_risk_score
from services.strategy_engine import get_payment_strategy
from services.escrow_manager import transition

router = APIRouter()

FRONTEND_BASE = "http://localhost:5173"
DELIVERY_COST = 20.0


class DeliveryWebhookBody(BaseModel):
    event: str
    merchant_id: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    total_amount: Optional[float] = None
    delivery_address: Optional[str] = None
    order_id: Optional[str] = None


@router.post("/delivery")
def delivery_webhook(body: DeliveryWebhookBody, db: Session = Depends(get_db)):
    if body.event == "shipment.created":
        customer = db.query(Customer).filter(Customer.phone == body.customer_phone).first()
        if not customer:
            customer = Customer(
                phone=body.customer_phone,
                name=body.customer_name or body.customer_phone,
            )
            db.add(customer)
            db.flush()

        risk_score = calculate_risk_score(customer)
        strategy_data = get_payment_strategy(risk_score, body.total_amount)
        now = datetime.utcnow()

        order = Order(
            id=str(uuid4()),
            merchant_id=body.merchant_id,
            customer_id=customer.id,
            product_name=body.product_name,
            total_amount=body.total_amount,
            delivery_address=body.delivery_address,
            strategy=strategy_data["strategy"],
            deposit_percentage=strategy_data["deposit_percentage"],
            deposit_amount=strategy_data["deposit_amount"],
            status="pending",
            created_at=now,
            expires_at=now + timedelta(hours=24),
        )
        db.add(order)
        db.flush()

        escrow = EscrowAccount(order_id=order.id, status="empty")
        db.add(escrow)
        db.add(Event(
            description=f"Webhook: طلب جديد من {customer.name} — {body.product_name}",
            order_id=order.id,
        ))
        db.commit()

        return {
            "order_id": order.id,
            "payment_url": f"{FRONTEND_BASE}/pay/{order.id}",
            "strategy": strategy_data["strategy"],
        }

    elif body.event == "shipment.delivered":
        order = db.query(Order).filter(Order.id == body.order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == body.order_id).first()
        if escrow.status != "funded":
            raise HTTPException(status_code=400, detail=f"Escrow not funded, status: {escrow.status}")

        transition(escrow, "driver_confirmed", db)
        order.status = "driver_delivered"
        db.add(Event(
            description=f"السائق أكد تسليم طلب {order.product_name}",
            order_id=body.order_id,
        ))
        db.commit()

        return {"status": "driver_confirmed"}

    elif body.event == "shipment.refused":
        order = db.query(Order).filter(Order.id == body.order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == body.order_id).first()
        refunded = round(escrow.total_held - DELIVERY_COST, 2)
        refunded = max(0.0, refunded)

        transition(escrow, "refunded", db)
        order.status = "returned"

        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
        customer.return_count += 1

        db.add(Transaction(order_id=body.order_id, type="refund", amount=refunded))
        db.add(Event(
            description=f"{customer.name} رفض الاستلام، خُصم {DELIVERY_COST}₪ وأُعيد {refunded}₪",
            order_id=body.order_id,
        ))
        db.commit()

        return {"status": "refunded", "refunded_amount": refunded}

    raise HTTPException(status_code=400, detail=f"Unknown event: {body.event}")
