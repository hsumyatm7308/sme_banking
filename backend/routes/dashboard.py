from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date
from database import get_db
from models import Transaction, User
from auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    current_month = today.month
    current_year = today.year

    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "income"
    ).scalar() or 0

    total_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).scalar() or 0

    monthly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "income",
        extract('month', Transaction.date) == current_month,
        extract('year', Transaction.date) == current_year
    ).scalar() or 0

    monthly_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        extract('month', Transaction.date) == current_month,
        extract('year', Transaction.date) == current_year
    ).scalar() or 0

    return {
        "total_balance": total_income - total_expenses,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "net_cash_flow": monthly_income - monthly_expenses
    }


@router.get("/monthly-summary")
def get_monthly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    months = []
    income_data = []
    expenses_data = []

    for i in range(5, -1, -1):
        month = today.month - i
        year = today.year
        if month <= 0:
            month += 12
            year -= 1

        month_name = date(year, month, 1).strftime("%b")
        months.append(month_name)

        income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "income",
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        ).scalar() or 0

        expense = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            extract('month', Transaction.date) == month,
            extract('year', Transaction.date) == year
        ).scalar() or 0

        income_data.append(income)
        expenses_data.append(expense)

    return {
        "months": months,
        "income": income_data,
        "expenses": expenses_data
    }
