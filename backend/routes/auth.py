from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User
from auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    phone: str
    password: str
    business_name: str
    owner_name: str
    sector: str


class UserResponse(BaseModel):
    id: int
    phone: str
    business_name: str
    owner_name: str
    sector: str
    role: str

    class Config:
        from_attributes = True


@router.post("/register", response_model=UserResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.phone == request.phone).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    user = User(
        phone=request.phone,
        password_hash=get_password_hash(request.password),
        business_name=request.business_name,
        owner_name=request.owner_name,
        sector=request.sector,
        role="sme_owner"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "phone": user.phone,
            "business_name": user.business_name,
            "owner_name": user.owner_name,
            "sector": user.sector,
            "role": user.role
        }
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
