from pydantic import BaseModel, EmailStr, Field, field_validator
import re

class UserBase(BaseModel):
    email: EmailStr

    @field_validator("email")
    def normalize_email(cls, v):
        return v.lower()


class UserSignup(UserBase):
    password: str = Field(..., min_length=6, max_length=72)

    @field_validator("password")
    def validate_password(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Must contain number")
        return v


class UserLogin(UserBase):
    password: str = Field(..., min_length=6, max_length=72)


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class EmailSchema(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=72)