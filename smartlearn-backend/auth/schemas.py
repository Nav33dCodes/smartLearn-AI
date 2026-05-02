from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ========================
# 🔐 BASE
# ========================
class UserBase(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str):
        return v.strip().lower()


# ========================
# 📝 SIGNUP
# ========================
class UserSignup(UserBase):
    password: str = Field(..., min_length=6, max_length=72)
    confirm_password: str = Field(..., min_length=6, max_length=72)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator("confirm_password")
    @classmethod
    def match_passwords(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


# ========================
# 🔑 LOGIN
# ========================
class UserLogin(UserBase):
    password: str = Field(..., min_length=6, max_length=72)


# ========================
# 📤 RESPONSE (SAFE)
# ========================
class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


# ========================
# 🔐 TOKEN RESPONSE
# ========================
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ========================
# 📧 FORGOT PASSWORD
# ========================
class ForgotPassword(BaseModel):
    email: EmailStr


# ========================
# 🔐 RESET PASSWORD
# ========================
class ResetPassword(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=72)
    confirm_password: str = Field(..., min_length=6, max_length=72)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain number")
        return v

    @field_validator("confirm_password")
    @classmethod
    def match_passwords(cls, v, info):
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v