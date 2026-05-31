"""
Authentication routes for lightweight demo accounts.
"""
from __future__ import annotations

import hashlib
import hmac
import re
import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from backend.database.db import User, get_db

router = APIRouter()


class AuthIn(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def valid_email(cls, value: str) -> str:
        email = value.lower().strip()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            raise ValueError("Enter a valid email address.")
        return email


class SignupIn(AuthIn):
    name: str = Field(min_length=1, max_length=80)


class AuthOut(BaseModel):
    id: int
    name: str
    email: str
    token: str


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000)
    return f"{salt}${digest.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split("$", 1)
        check = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000)
        return hmac.compare_digest(check.hex(), digest)
    except Exception:
        return False


def _auth_out(user: User) -> AuthOut:
    return AuthOut(
        id=user.id,
        name=user.name,
        email=user.email,
        token=secrets.token_urlsafe(32),
    )


@router.post("/auth/signup", response_model=AuthOut)
def signup(payload: SignupIn, db=Depends(get_db)):
    email = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account already exists for this email.")

    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=_hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _auth_out(user)


@router.post("/auth/login", response_model=AuthOut)
def login(payload: AuthIn, db=Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user or not _verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return _auth_out(user)
