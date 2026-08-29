from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from database import get_db
from models import Transaction, User
from auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


class TransactionCreate(BaseModel):
    type: str
    amount: float
    category: str
    description: Optional[str] = None
    date: date


class TransactionResponse(BaseModel):
    id: int
    type: str
    amount: float
    category: str
    description: Optional[str]
    date: date

    class Config:
        from_attributes = True


class TransactionStats(BaseModel):
    total_income: float
    total_expense: float
    net_balance: float
    transaction_count: int


@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    type: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if type:
        query = query.filter(Transaction.type == type)
    if month and year:
        query = query.filter(
            func.extract('month', Transaction.date) == month,
            func.extract('year', Transaction.date) == year
        )
    if category:
        query = query.filter(Transaction.category == category)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Transaction.category.ilike(search_term)) |
            (Transaction.description.ilike(search_term))
        )
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    return query.order_by(Transaction.date.desc()).all()


@router.get("/stats", response_model=TransactionStats)
def get_transaction_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = db.query(
        func.sum(Transaction.amount),
        Transaction.type
    ).filter(
        Transaction.user_id == current_user.id
    ).group_by(Transaction.type).all()

    stats = {"total_income": 0, "total_expense": 0, "net_balance": 0, "transaction_count": 0}

    for total, t_type in result:
        if t_type == "income":
            stats["total_income"] = total or 0
        elif t_type == "expense":
            stats["total_expense"] = total or 0

    stats["net_balance"] = stats["total_income"] - stats["total_expense"]
    stats["transaction_count"] = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).count()

    return stats


@router.get("/categories", response_model=List[str])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    categories = db.query(Transaction.category).filter(
        Transaction.user_id == current_user.id
    ).distinct().all()
    return [c[0] for c in categories]


@router.post("", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_transaction = Transaction(
        user_id=current_user.id,
        type=transaction.type,
        amount=transaction.amount,
        category=transaction.category,
        description=transaction.description,
        date=transaction.date
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db_transaction.type = transaction.type
    db_transaction.amount = transaction.amount
    db_transaction.category = transaction.category
    db_transaction.description = transaction.description
    db_transaction.date = transaction.date

    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted"}
