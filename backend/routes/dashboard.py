from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db
from models import Merchant, Customer, Order, EscrowAccount

router = APIRouter()


@router.get("/{merchant_id}")
def get_dashboard(merchant_id: str, db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    orders = db.query(Order).filter(Order.merchant_id == merchant_id).all()
    total_orders = len(orders)

    escrow_held = 0.0
    released_this_week = 0.0
    returned_count = 0
    one_week_ago = datetime.utcnow() - timedelta(days=7)

    orders_list = []
    for o in sorted(orders, key=lambda x: x.created_at, reverse=True):
        escrow = db.query(EscrowAccount).filter(EscrowAccount.order_id == o.id).first()
        customer = db.query(Customer).filter(Customer.id == o.customer_id).first()

        if escrow:
            if escrow.status in ("funded", "driver_confirmed"):
                escrow_held += escrow.total_held
            if escrow.status in ("released", "auto_released") and escrow.released_at and escrow.released_at > one_week_ago:
                released_this_week += escrow.merchant_share

        if o.status == "returned":
            returned_count += 1

        orders_list.append({
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
            "can_cancel": (escrow.status == "empty") if escrow else False,
        })

    return_rate = round((returned_count / total_orders * 100), 1) if total_orders > 0 else 0.0

    return {
        "merchant": {
            "name": merchant.name,
            "balance": merchant.balance,
        },
        "stats": {
            "total_orders": total_orders,
            "escrow_held": round(escrow_held, 2),
            "released_this_week": round(released_this_week, 2),
            "return_rate_percent": return_rate,
            "returned_count": returned_count,
        },
        "orders": orders_list,
    }
