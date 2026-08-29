from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, timedelta
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
    phone: str

    class Config:
        from_attributes = True


class BankStats(BaseModel):
    total_smes: int
    active_smes: int
    high_risk_smes: int
    total_volume: float


class SectorBreakdown(BaseModel):
    sector: str
    count: int
    total_volume: float


class MonthlyTrend(BaseModel):
    month: str
    income: float
    expense: float


def calculate_risk_level(balance: float, monthly_income: float, inactive_months: int) -> str:
    if balance < 0 or (balance < 50000 and inactive_months >= 2):
        return "high"
    elif balance < 100000 or inactive_months >= 1:
        return "medium"
    return "low"


@router.get("/sme-list", response_model=List[SMESummary])
def get_sme_list(
    search: Optional[str] = None,
    sector: Optional[str] = None,
    risk: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "bank_admin":
        raise HTTPException(status_code=403, detail="Bank admin access required")

    sme_users = db.query(User).filter(User.role == "sme_owner").all()

    if search:
        term = f"%{search}%"
        sme_users = [s for s in sme_users if
                     s.business_name.lower().startswith(search.lower()) or
                     s.owner_name.lower().startswith(search.lower()) or
                     s.sector.lower().startswith(search.lower())]

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

        if sector and sme.sector != sector:
            continue
        if risk and risk_level != risk:
            continue

        result.append(SMESummary(
            id=sme.id,
            business_name=sme.business_name,
            owner_name=sme.owner_name,
            sector=sme.sector,
            total_income=total_income,
            total_expenses=total_expenses,
            balance=balance,
            risk_level=risk_level,
            transaction_count=transaction_count,
            phone=sme.phone
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

    active_smes = db.query(User).filter(
        User.role == "sme_owner",
        User.id.in_(db.query(Transaction.user_id).distinct())
    ).count()

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


@router.get("/sector-breakdown", response_model=List[SectorBreakdown])
def get_sector_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "bank_admin":
        raise HTTPException(status_code=403, detail="Bank admin access required")

    sme_users = db.query(User).filter(User.role == "sme_owner").all()
    sector_map = {}

    for sme in sme_users:
        total = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == sme.id
        ).scalar() or 0
        count = db.query(Transaction).filter(
            Transaction.user_id == sme.id
        ).count()

        if sme.sector not in sector_map:
            sector_map[sme.sector] = {"count": 0, "volume": 0}
        sector_map[sme.sector]["count"] += 1
        sector_map[sme.sector]["volume"] += total

    return [
        SectorBreakdown(sector=s, count=d["count"], total_volume=d["volume"])
        for s, d in sector_map.items()
    ]


@router.get("/monthly-trends", response_model=List[MonthlyTrend])
def get_monthly_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "bank_admin":
        raise HTTPException(status_code=403, detail="Bank admin access required")

    months = []
    today = date.today()
    for i in range(5, -1, -1):
        d = today.replace(day=1) - timedelta(days=i * 30)
        months.append((d.year, d.month))

    result = []
    for year, month in months:
        income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.type == "income",
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        ).scalar() or 0

        expense = db.query(func.sum(Transaction.amount)).filter(
            Transaction.type == "expense",
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        ).scalar() or 0

        month_name = date(year, month, 1).strftime("%b %Y")
        result.append(MonthlyTrend(month=month_name, income=income, expense=expense))

    return result


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

    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == sme_id,
        Transaction.type == "income"
    ).scalar() or 0

    total_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == sme_id,
        Transaction.type == "expense"
    ).scalar() or 0

    balance = total_income - total_expenses
    risk_level = calculate_risk_level(balance, total_income, 0)

    transactions = db.query(Transaction).filter(
        Transaction.user_id == sme_id
    ).order_by(Transaction.date.desc()).all()

    monthly_data = []
    today = date.today()
    for i in range(5, -1, -1):
        d = today.replace(day=1) - timedelta(days=i * 30)
        inc = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == sme_id,
            Transaction.type == "income",
            extract('month', Transaction.date) == d.month,
            extract('year', Transaction.date) == d.year
        ).scalar() or 0
        exp = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == sme_id,
            Transaction.type == "expense",
            extract('month', Transaction.date) == d.month,
            extract('year', Transaction.date) == d.year
        ).scalar() or 0
        monthly_data.append({
            "month": d.strftime("%b"),
            "income": inc,
            "expense": exp
        })

    return {
        "sme": {
            "id": sme.id,
            "business_name": sme.business_name,
            "owner_name": sme.owner_name,
            "sector": sme.sector,
            "phone": sme.phone,
            "created_at": sme.created_at,
            "total_income": total_income,
            "total_expenses": total_expenses,
            "balance": balance,
            "risk_level": risk_level,
        },
        "monthly": monthly_data,
        "transactions": [
            {
                "id": t.id,
                "type": t.type,
                "amount": t.amount,
                "category": t.category,
                "description": t.description,
                "date": t.date
            }
            for t in transactions
        ]
    }
