from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.auth import create_token, current_user, hash_password, public_user, verify_password
from app.database.mongodb import get_database
from app.schemas import TokenResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate):
    database = get_database()
    document = {"name": data.name, "email": data.email.lower(), "password_hash": hash_password(data.password), "created_at": datetime.now(timezone.utc)}
    try:
        result = database.users.insert_one(document)
    except DuplicateKeyError as error:
        raise HTTPException(status_code=409, detail="An account with this email already exists") from error
    return {"access_token": create_token(str(result.inserted_id)), "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    user = get_database().users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_token(str(user["_id"])), "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def me(user: dict = Depends(current_user)):
    return public_user(user)


@router.post("/logout")
def logout(_: dict = Depends(current_user)):
    return {"success": True}
