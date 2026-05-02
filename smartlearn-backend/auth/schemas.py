from pydantic import BaseModel, EmailStr, Field

# 🔐 Common base (reuse)
class UserBase(BaseModel):
    email: EmailStr


# 📝 Signup Schema
class UserSignup(UserBase):
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Password must be at least 6 characters"
    )


# 🔑 Login Schema
class UserLogin(UserBase):
    password: str = Field(..., min_length=6)


# 📤 Response Schema (safe - no password)
class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True  # SQLAlchemy support


# 🔐 Token Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# 📧 Optional (for future features)
class EmailSchema(BaseModel):
    email: EmailStr


# 🔄 Reset Password (future)
class ResetPassword(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)