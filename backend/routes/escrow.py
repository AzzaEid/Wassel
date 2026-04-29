from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Order, EscrowAccount, Customer, Merchant, Transaction, Event
from services.escrow_manager import transition
from services.mock_gateway import charge_saved_card

router = APIRouter()

DELIVERY_COST = 20.0


@router.post("/{order_id}/customer-confirm")
def customer_confirm(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")

    if order.source == "manual":
        # No delivery company — customer confirms directly after payment
        if escrow.status != "funded":
            raise HTTPException(status_code=400, detail="Order has not been paid yet")
    else:
        # Delivery company involved — driver must confirm first
        if escrow.status != "driver_confirmed":
            raise HTTPException(status_code=400, detail="Driver has not confirmed delivery yet")

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
        description=f"{customer.name} — أكد الاستلام، أُفرج {escrow.merchant_share}₪ للتاجر",
        order_id=order_id,
    ))
    db.commit()

    return {
        "escrow_status": "released",
        "merchant_credited": escrow.merchant_share,
        "order_status": "completed",
    }


@router.post("/{order_id}/dispute")
def dispute_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    if not escrow or escrow.status not in ("funded", "driver_confirmed"):
        raise HTTPException(status_code=400, detail="Cannot dispute in current escrow state")

    refunded = round(escrow.total_held - DELIVERY_COST, 2)
    refunded = max(0.0, refunded)

    transition(escrow, "frozen", db)
    order.status = "disputed"

    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    db.add(Event(
        description=f"{customer.name} — أبلغ عن مشكلة، خُصم {DELIVERY_COST}₪ توصيل وأُعيد {refunded}₪",
        order_id=order_id,
    ))
    db.commit()

    return {
        "escrow_status": "frozen",
        "delivery_cost_deducted": DELIVERY_COST,
        "refunded_amount": refunded,
        "order_status": "disputed",
    }
