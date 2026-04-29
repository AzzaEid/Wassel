from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from uuid import uuid4


class Merchant(Base):
    __tablename__ = "merchants"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False)
    phone = Column(String)
    balance = Column(Float, default=0.0)


class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    phone = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    total_orders = Column(Integer, default=0)
    return_count = Column(Integer, default=0)


class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    merchant_id = Column(String, ForeignKey("merchants.id"))
    customer_id = Column(String, ForeignKey("customers.id"))
    product_name = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    delivery_address = Column(String, nullable=True)
    strategy = Column(String)
    deposit_percentage = Column(Integer)
    deposit_amount = Column(Float)
    status = Column(String, default="pending")
    source = Column(String, default="manual")  # "manual" | "webhook"
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)


class EscrowAccount(Base):
    __tablename__ = "escrow_accounts"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    order_id = Column(String, ForeignKey("orders.id"), unique=True)
    total_held = Column(Float, default=0.0)
    merchant_share = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0)
    status = Column(String, default="empty")
    card_token = Column(String, nullable=True)
    funded_at = Column(DateTime, nullable=True)
    auto_release_at = Column(DateTime, nullable=True)
    released_at = Column(DateTime, nullable=True)
    driver_confirmed_at = Column(DateTime, nullable=True)


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    order_id = Column(String, ForeignKey("orders.id"))
    type = Column(String)
    amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow)
    description = Column(String)
    order_id = Column(String, nullable=True)
