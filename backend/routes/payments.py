from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta

from database import get_db
from models import Order, EscrowAccount, Transaction, Event
from services.mock_gateway import create_payment, charge_saved_card

router = APIRouter()

DELIVERY_COST = 20.0


class PayBody(BaseModel):
    payment_type: str  # "deposit" | "full"
    mock_card: str = "4242424242424242"


@router.post("/{order_id}/pay")
def pay_order(order_id: str, body: PayBody, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    if not escrow or escrow.status != "empty":
        raise HTTPException(status_code=400, detail="Order already paid or not payable")

    if body.payment_type == "full":
        amount = order.total_amount
        new_order_status = "fully_paid"
    else:
        amount = order.deposit_amount
        new_order_status = "deposit_paid"

    gw = create_payment(amount, body.mock_card)

    now = datetime.utcnow()
    escrow.total_held = amount
    escrow.status = "funded"
    escrow.card_token = gw["card_token"]
    escrow.funded_at = now
    escrow.auto_release_at = now + timedelta(hours=48)

    order.status = new_order_status

    db.add(Transaction(
        order_id=order_id,
        type=body.payment_type,
        amount=amount,
    ))
    db.add(Event(
        description=f"دفع {amount}₪ ({body.payment_type}) — الطلب {order.product_name}",
        order_id=order_id,
    ))
    db.commit()

    return {
        "escrow_status": "funded",
        "amount_paid": amount,
        "order_status": new_order_status,
        "card_token": gw["card_token"],
    }


@router.post("/{order_id}/charge-remaining")
def charge_remaining(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == order_id).first()
    if not escrow or not escrow.card_token:
        raise HTTPException(status_code=400, detail="No saved card for this order")

    remaining = round(order.total_amount - order.deposit_amount, 2)
    charge_saved_card(escrow.card_token, remaining)

    escrow.total_held = round(escrow.total_held + remaining, 2)

    db.add(Transaction(order_id=order_id, type="remaining", amount=remaining))
    db.commit()

    return {"success": True, "amount_charged": remaining}
