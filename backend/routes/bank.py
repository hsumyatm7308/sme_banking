from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import Transaction, User
from auth import get_current_user

router = APIRouter(prefix="/api/bank", tags=["bank"])


class SMESummary(BaseModel):
    id: int
    business_name: str
    owner_name: str
    sector: str
    total_income: float
    total_expenses: float
    balance: float
    risk_level: str
    transaction_count: int

    class Config:
        from_attributes = True


class BankStats(BaseModel):
    total_smes: int
    active_smes: int
    high_risk_smes: int
    total_volume: float


def calculate_risk_level(balance: float, monthly_income: float, inactive_months: int) -> str:
    if balance < 50000 and inactive_months >= 2:
        return "high"
    elif balance < 100000 or inactive_months >= 1:
        return "medium"
    return "low"


@router.get("/sme-list", response_model=List[SMESummary])
def get_sme_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "bank_admin":
        raise HTTPException(status_code=403, detail="Bank admin access required")

    sme_users = db.query(User).filter(User.role == "sme_owner").all()
    result = []

    for sme in sme_users:
        total_income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == sme.id,
            Transaction.type == "income"
        ).scalar() or 0

        total_expenses = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == sme.id,
            Transaction.type == "expense"
        ).scalar() or 0

        transaction_count = db.query(Transaction).filter(
            Transaction.user_id == sme.id
        ).count()

        balance = total_income - total_expenses

        monthly_income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == sme.id,
            Transaction.type == "income"
        ).scalar() or 0

        risk_level = calculate_risk_level(balance, monthly_income, 0)

        result.append(SMESummary(
            id=sme.id,
            business_name=sme.business_name,
            owner_name=sme.owner_name,
            sector=sme.sector,
            total_income=total_income,
            total_expenses=total_expenses,
            balance=balance,
            risk_level=risk_level,
            transaction_count=transaction_count
        ))

    return result


@router.get("/analytics/summary", response_model=BankStats)
def get_bank_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "bank_admin":
        raise HTTPException(status_code=403, detail="Bank admin access required")

    total_smes = db.query(User).filter(User.role == "sme_owner").count()
    active_smes = db.query(User).filter(User.role == "sme_owner").count()

    all_transactions = db.query(func.sum(Transaction.amount)).scalar() or 0

    high_risk_count = 0
    sme_users = db.query(User).filter(User.role == "sme_owner").all()
    for sme in sme_users:
        balance = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == sme.id,
            Transaction.type == "income"
        ).scalar() or 0
        balance -= db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == sme.id,
            Transaction.type == "expense"
        ).scalar() or 0
        if balance < 50000:
            high_risk_count += 1

    return BankStats(
        total_smes=total_smes,
        active_smes=active_smes,
        high_risk_smes=high_risk_count,
        total_volume=all_transactions
    )


@router.get("/sme/{sme_id}")
def get_sme_details(
    sme_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "bank_admin":
        raise HTTPException(status_code=403, detail="Bank admin access required")

    sme = db.query(User).filter(User.id == sme_id, User.role == "sme_owner").first()
    if not sme:
        raise HTTPException(status_code=404, detail="SME not found")

    transactions = db.query(Transaction).filter(Transaction.user_id == sme_id).order_by(Transaction.date.desc()).all()

    return {
        "sme": {
            "id": sme.id,
            "business_name": sme.business_name,
            "owner_name": sme.owner_name,
            "sector": sme.sector,
            "created_at": sme.created_at
        },
        "transactions": [
            {
                "id": t.id,
                "type": t.type,
                "amount": t.amount,
                "category": t.category,
                "date": t.date
            }
            for t in transactions
        ]
    }
