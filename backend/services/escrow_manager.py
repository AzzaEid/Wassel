from datetime import datetime

VALID_TRANSITIONS = {
    "empty": ["funded", "cancelled", "expired"],
    "funded": ["driver_confirmed", "released", "frozen", "refunded", "auto_released", "cancelled"],
    "driver_confirmed": ["released", "frozen", "auto_released"],
    "released": [],
    "auto_released": [],
    "frozen": ["refunded"],
    "refunded": [],
    "cancelled": [],
    "expired": [],
}


def transition(escrow, new_status: str, db):
    if new_status not in VALID_TRANSITIONS[escrow.status]:
        raise ValueError(f"Invalid transition: {escrow.status} → {new_status}")
    escrow.status = new_status
    if new_status in ("released", "auto_released"):
        escrow.released_at = datetime.utcnow()
        escrow.merchant_share = round(escrow.total_held * 0.985, 2)
        escrow.platform_fee = round(escrow.total_held * 0.015, 2)
    if new_status == "driver_confirmed":
        escrow.driver_confirmed_at = datetime.utcnow()
    db.commit()
