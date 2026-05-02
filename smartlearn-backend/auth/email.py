import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

load_dotenv()


def get_mail_config():
    # ✅ Only create config if env vars exist
    if not os.getenv("MAIL_USERNAME"):
        return None

    return ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
        MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
        MAIL_FROM=os.getenv("MAIL_FROM"),
        MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
        MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )


async def send_welcome_email(email: str):
    conf = get_mail_config()

    # 🔥 Prevent crash if env not set
    if not conf:
        print("⚠️ Email skipped (env not configured)")
        return

    message = MessageSchema(
        subject="Welcome to SmartLearn 🚀",
        recipients=[email],
        body="""
Hello 👋

Welcome to SmartLearn AI!

Your account has been successfully created.

Start learning smarter 🚀
""",
        subtype="plain"
    )

    fm = FastMail(conf)

    try:
        await fm.send_message(message)
        print("✅ Email sent successfully")
    except Exception as e:
        print("❌ Email error:", str(e))