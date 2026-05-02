import os
import asyncio
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig


def get_mail_config():
    required = ["MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_FROM"]

    if not all(os.getenv(var) for var in required):
        return None

    return ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
        MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
        MAIL_FROM=os.getenv("MAIL_FROM"),
        MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "SmartLearn AI"),
        MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
        MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )


# ========================
# 📧 WELCOME EMAIL
# ========================
async def send_welcome_email(email: str):
    if "@" not in email:
        print("❌ Invalid email")
        return

    conf = get_mail_config()
    if not conf:
        print("⚠️ Email skipped (missing env vars)")
        return

    message = MessageSchema(
        subject="Welcome to SmartLearn 🚀",
        recipients=[email],
        body="""
<h3>Hello 👋</h3>
<p>Welcome to <b>SmartLearn AI</b> 🚀</p>
<p>Your account has been successfully created.</p>
""",
        subtype="html"
    )

    fm = FastMail(conf)

    async def send():
        try:
            await fm.send_message(message)
            print(f"✅ Email sent to {email}")
        except Exception as e:
            print(f"❌ Email failed: {e}")

    asyncio.create_task(send())


# ========================
# 🔐 RESET PASSWORD EMAIL
# ========================
async def send_reset_email(email: str, token: str):
    conf = get_mail_config()

    if not conf:
        print("⚠️ Email skipped")
        return

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

    message = MessageSchema(
        subject="Reset Your Password 🔐",
        recipients=[email],
        body=f"""
<h3>Password Reset</h3>
<p>Click below to reset your password:</p>

<a href="{reset_link}" 
style="
display:inline-block;
padding:10px 20px;
background:#10a37f;
color:white;
text-decoration:none;
border-radius:6px;
">
Reset Password
</a>

<p>This link expires in 15 minutes.</p>
""",
        subtype="html"
    )

    fm = FastMail(conf)

    async def send():
        try:
            await fm.send_message(message)
            print(f"✅ Reset email sent to {email}")
        except Exception as e:
            print("❌ Email error:", e)

    asyncio.create_task(send())