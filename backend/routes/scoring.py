from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Customer
from services.risk_scorer import calculate_risk_score
from services.strategy_engine import get_payment_strategy

router = APIRouter()


def generate_ai_insight(customer, risk_score: float, strategy: dict) -> str:
    if not customer:
        return "زبون جديد — لا سجل سابق لدى وصّل. يُطبَّق دفع كامل مسبق لحماية التاجر حتى تنشأ علاقة ثقة."

    rate = round((customer.return_count / customer.total_orders) * 100) if customer.total_orders else 0
    orders = customer.total_orders
    dep = strategy.get("deposit_percentage", 100)

    if risk_score >= 80:
        return f"زبون موثوق جداً — {orders} طلب ناجح بنسبة إعادة {rate}٪. وصّل تمنحه الدفع كاملاً عند الاستلام بدون قيد."
    elif risk_score >= 60:
        return f"سجل جيد مع إعادات محدودة ({rate}٪ من {orders} طلب). وصّل تقترح عربون {dep}٪ لتوزيع المخاطرة بين الطرفين."
    elif risk_score >= 30:
        return f"نسبة إعادة مرتفعة ({rate}٪ من {orders} طلب). وصّل تطلب عربون {dep}٪ لتغطية تكاليف التوصيل المحتملة."
    else:
        return f"تاريخ مخاطرة عالٍ — {customer.return_count} إعادة من أصل {orders} طلب ({rate}٪). وصّل تفرض دفعاً كاملاً مسبقاً."


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
            "ai_insight": generate_ai_insight(None, 0, strategy),
        }

    risk_score = calculate_risk_score(customer)
    strategy = get_payment_strategy(risk_score, 0)
    return {
        "exists": True,
        "customer_name": customer.name,
        "risk_score": risk_score,
        "strategy_recommendation": strategy["strategy"],
        "reasoning": strategy["reasoning"],
        "ai_insight": generate_ai_insight(customer, risk_score, strategy),
    }
