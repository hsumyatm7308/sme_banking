from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True)
    password_hash = Column(String)
    business_name = Column(String)
    owner_name = Column(String)
    sector = Column(String)
    role = Column(String, default="sme_owner")
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="owner")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)
    amount = Column(Float)
    category = Column(String)
    description = Column(String, nullable=True)
    date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="transactions")
