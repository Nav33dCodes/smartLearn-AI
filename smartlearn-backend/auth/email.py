import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

# Load environment variables from .env file
load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_welcome_email(email: str):
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
    await fm.send_message(message)