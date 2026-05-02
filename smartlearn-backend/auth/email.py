from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import os

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("naveedahmed.social@gmail.com"),
    MAIL_PASSWORD=os.getenv("fugq vmwx rigl zhpi"),
    MAIL_FROM=os.getenv("naveedahmed.social@gmail.com"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
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


    
