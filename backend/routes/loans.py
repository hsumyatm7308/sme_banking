from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
from models import LoanApplication, User
from auth import get_current_user

router = APIRouter(prefix="/api/loans", tags=["loans"])


class LoanCreate(BaseModel):
    amount: float
    purpose: str
    description: Optional[str] = None
    duration_months: int = 12


class LoanReview(BaseModel):
    status: str  # approved or rejected
    admin_notes: Optional[str] = None


class LoanResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    purpose: str
    description: Optional[str]
    duration_months: int
    status: str
    admin_notes: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    business_name: Optional[str] = None
    owner_name: Optional[str] = None
    sector: Optional[str] = None

    class Config:
        from_attributes = True


@router.post("", response_model=LoanResponse)
def create_loan(
    loan: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "sme_owner":
        raise HTTPException(status_code=403, detail="SME owners only")

    existing_pending = db.query(LoanApplication).filter(
        LoanApplication.user_id == current_user.id,
        LoanApplication.status == "pending"
    ).first()
    if existing_pending:
        raise HTTPException(status_code=400, detail="You already have a pending loan application")

    db_loan = LoanApplication(
        user_id=current_user.id,
        amount=loan.amount,
        purpose=loan.purpose,
        description=loan.description,
        duration_months=loan.duration_months,
    )
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)

    return LoanResponse(
        id=db_loan.id,
        user_id=db_loan.user_id,
        amount=db_loan.amount,
        purpose=db_loan.purpose,
        description=db_loan.description,
        duration_months=db_loan.duration_months,
        status=db_loan.status,
        admin_notes=db_loan.admin_notes,
        reviewed_at=db_loan.reviewed_at,
        created_at=db_loan.created_at,
        business_name=current_user.business_name,
        owner_name=current_user.owner_name,
        sector=current_user.sector,
    )


@router.get("", response_model=List[LoanResponse])
def get_my_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    loans = db.query(LoanApplication).filter(
        LoanApplication.user_id == current_user.id
    ).order_by(LoanApplication.created_at.desc()).all()

    return [
        LoanResponse(
            id=l.id,
            user_id=l.user_id,
            amount=l.amount,
            purpose=l.purpose,
            description=l.description,
            duration_months=l.duration_months,
            status=l.status,
            admin_notes=l.admin_notes,
            reviewed_at=l.reviewed_at,
            created_at=l.created_at,
            business_name=current_user.business_name,
            owner_name=current_user.owner_name,
            sector=current_user.sector,
        )
        for l in loans
    ]


@router.get("/all", response_model=List[LoanResponse])
def get_all_loans(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "bank_admin":
        raise HTTPException(status_code=403, detail="Bank admin access required")

    query = db.query(LoanApplication)
    if status:
        query = query.filter(LoanApplication.status == status)

    loans = query.order_by(LoanApplication.created_at.desc()).all()

    result = []
    for l in loans:
        user = db.query(User).filter(User.id == l.user_id).first()
        result.append(LoanResponse(
            id=l.id,
            user_id=l.user_id,
            amount=l.amount,
            purpose=l.purpose,
            description=l.description,
            duration_months=l.duration_months,
            status=l.status,
            admin_notes=l.admin_notes,
            reviewed_at=l.reviewed_at,
            created_at=l.created_at,
            business_name=user.business_name if user else None,
            owner_name=user.owner_name if user else None,
            sector=user.sector if user else None,
        ))

    return result


@router.put("/{loan_id}/review", response_model=LoanResponse)
def review_loan(
    loan_id: int,
    review: LoanReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "bank_admin":
        raise HTTPException(status_code=403, detail="Bank admin access required")

    loan = db.query(LoanApplication).filter(LoanApplication.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan application not found")

    if loan.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending loans can be reviewed")

    if review.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")

    loan.status = review.status
    loan.admin_notes = review.admin_notes
    loan.reviewed_by = current_user.id
    loan.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(loan)

    user = db.query(User).filter(User.id == loan.user_id).first()
    return LoanResponse(
        id=loan.id,
        user_id=loan.user_id,
        amount=loan.amount,
        purpose=loan.purpose,
        description=loan.description,
        duration_months=loan.duration_months,
        status=loan.status,
        admin_notes=loan.admin_notes,
        reviewed_at=loan.reviewed_at,
        created_at=loan.created_at,
        business_name=user.business_name if user else None,
        owner_name=user.owner_name if user else None,
        sector=user.sector if user else None,
    )


@router.get("/stats")
def get_loan_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(LoanApplication).count()
    pending = db.query(LoanApplication).filter(LoanApplication.status == "pending").count()
    approved = db.query(LoanApplication).filter(LoanApplication.status == "approved").count()
    rejected = db.query(LoanApplication).filter(LoanApplication.status == "rejected").count()

    from sqlalchemy import func
    total_approved_amount = db.query(func.sum(LoanApplication.amount)).filter(
        LoanApplication.status == "approved"
    ).scalar() or 0

    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "total_approved_amount": total_approved_amount,
    }
