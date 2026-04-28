from uuid import uuid4


def create_payment(amount: float, card_data: str) -> dict:
    return {
        "success": True,
        "transaction_id": str(uuid4()),
        "card_token": f"mock_tok_{str(uuid4())[:12]}",
    }


def charge_saved_card(card_token: str, amount: float) -> dict:
    return {
        "success": True,
        "transaction_id": str(uuid4()),
    }
