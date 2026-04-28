from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Customer
from services.risk_scorer import calculate_risk_score
from services.strategy_engine import get_payment_strategy

router = APIRouter()


@router.get("/{customer_phone}")
def get_scoring(customer_phone: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.phone == customer_phone).first()
    if not customer:
        strategy = get_payment_strategy(0, 0)
        return {
            "exists": False,
            "customer_name": None,
            "risk_score": 0,
            "strategy_recommendation": strategy["strategy"],
            "reasoning": strategy["reasoning"],
        }

    risk_score = calculate_risk_score(customer)
    strategy = get_payment_strategy(risk_score, 0)
    return {
        "exists": True,
        "customer_name": customer.name,
        "risk_score": risk_score,
        "strategy_recommendation": strategy["strategy"],
        "reasoning": strategy["reasoning"],
    }
