def calculate_risk_score(customer) -> float:
    if customer.total_orders == 0:
        return 0.0

    return_rate = customer.return_count / customer.total_orders
    score = 100.0
    score -= return_rate * 70
    score -= max(0, (5 - customer.total_orders)) * 2
    return round(max(0.0, min(100.0, score)), 1)
