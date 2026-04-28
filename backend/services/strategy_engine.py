def get_payment_strategy(risk_score: float, order_value: float) -> dict:
    if risk_score == 0:
        return {
            "strategy": "full",
            "deposit_percentage": 100,
            "deposit_amount": round(order_value, 2),
            "remaining_amount": 0.0,
            "reasoning": "زبون جديد — دفع كامل مسبق مطلوب",
        }
    elif risk_score < 30:
        return {
            "strategy": "full",
            "deposit_percentage": 100,
            "deposit_amount": round(order_value, 2),
            "remaining_amount": 0.0,
            "reasoning": f"تاريخ إرجاعات مرتفع — درجة الثقة: {risk_score}",
        }
    elif risk_score < 60:
        pct = 30
        deposit = round(order_value * pct / 100, 2)
        return {
            "strategy": "deposit",
            "deposit_percentage": pct,
            "deposit_amount": deposit,
            "remaining_amount": round(order_value - deposit, 2),
            "reasoning": f"زبون متوسط — عربون {pct}% لتأكيد الجدية",
        }
    elif risk_score < 80:
        pct = 20
        deposit = round(order_value * pct / 100, 2)
        return {
            "strategy": "deposit",
            "deposit_percentage": pct,
            "deposit_amount": deposit,
            "remaining_amount": round(order_value - deposit, 2),
            "reasoning": f"زبون جيد — عربون {pct}% كافٍ",
        }
    else:
        return {
            "strategy": "cod_protected",
            "deposit_percentage": 0,
            "deposit_amount": 0.0,
            "remaining_amount": round(order_value, 2),
            "reasoning": f"زبون موثوق — درجة الثقة: {risk_score}",
        }
