import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

def send_email(to_email: str, subject: str, body: str):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print(f"Warning: SMTP credentials not set. Would have sent email to {to_email}: {subject}")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def get_premium_template(title: str, content_html: str, show_warning: bool = False, warning_text: str = "") -> str:
    warning_block = f"""
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eaeaea; color: #666666; font-size: 13px; line-height: 20px;">
        {warning_text}
    </div>
    """ if show_warning else ""
    
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                background-color: #f6f9fc;
                margin: 0;
                padding: 40px 20px;
                -webkit-font-smoothing: antialiased;
            }}
            .container {{
                max-width: 580px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #eaeaea;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
            }}
            .logo {{
                display: flex;
                align-items: center;
                margin-bottom: 32px;
                font-size: 22px;
                font-weight: 700;
                color: #111111;
                letter-spacing: -0.5px;
            }}
            .logo span {{
                color: #ff3131;
                margin-left: 4px;
            }}
            .title {{
                color: #111111;
                font-size: 24px;
                font-weight: 600;
                margin-top: 0;
                margin-bottom: 24px;
                letter-spacing: -0.5px;
            }}
            .text {{
                color: #444444;
                font-size: 15px;
                line-height: 24px;
                margin-bottom: 24px;
            }}
            .footer {{
                text-align: center;
                margin-top: 32px;
                color: #8898aa;
                font-size: 12px;
                line-height: 16px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="{FRONTEND_URL}/images/logo.svg" alt="Logo" width="28" height="28" style="margin-right: 10px;">
                SmartLearn<span>AI</span>
            </div>
            <h1 class="title">{title}</h1>
            {content_html}
            {warning_block}
        </div>
        <div class="footer">
            &copy; 2026 SmartLearn AI. All rights reserved.<br>
            Secure automated communication system.
        </div>
    </body>
    </html>
    """

def send_welcome_email(to_email: str, name: str):
    subject = "Welcome to SmartLearn AI!"
    content = f"""
    <p class="text">Hi {name},</p>
    <p class="text">Welcome to the future of learning. We're thrilled to have you onboard.</p>
    <p class="text">SmartLearn AI is designed to help you digest information faster, understand complex topics effortlessly, and unlock your true learning potential using advanced retrieval-augmented generation.</p>
    <div style="margin: 36px 0;">
        <a href="{FRONTEND_URL}" style="background-color: #ff3131; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(255, 49, 49, 0.25);">Get Started Now</a>
    </div>
    <p class="text" style="color: #666666; font-size: 14px;">If you have any questions or need assistance, simply reply to this email. We're here to help.</p>
    """
    body = get_premium_template("Welcome to SmartLearn!", content)
    return send_email(to_email, subject, body)

def send_otp_email(to_email: str, otp: str):
    subject = "Your SmartLearn AI Password Reset Code"
    content = f"""
    <p class="text">We received a request to reset the password associated with your account.</p>
    <p class="text">Please use the verification code below to securely reset your password:</p>
    <div style="background-color: #fff5f5; border: 1px solid #fee2e2; border-radius: 8px; padding: 28px; text-align: center; margin: 36px 0;">
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 700; letter-spacing: 12px; color: #ff3131;">{otp}</div>
    </div>
    <p class="text" style="font-size: 14px; color: #666666;">This code is valid for 15 minutes.</p>
    """
    warning = "If you did not request a password reset, please ignore this email or contact support immediately."
    body = get_premium_template("Password Reset Request", content, show_warning=True, warning_text=warning)
    return send_email(to_email, subject, body)

def send_password_reset_success_email(to_email: str):
    subject = "Your SmartLearn AI Password Has Been Reset"
    content = """
    <p class="text">This email confirms that the password for your SmartLearn AI account has been successfully changed.</p>
    <p class="text">You can now log in to your account using your new password.</p>
    <div style="margin: 36px 0;">
        <a href="{FRONTEND_URL}/login" style="background-color: #ff3131; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(255, 49, 49, 0.25);">Log In to Account</a>
    </div>
    """
    warning = "Security Notice: If you did not authorize this change, please contact our support team immediately."
    body = get_premium_template("Password Reset Successful", content, show_warning=True, warning_text=warning)
    return send_email(to_email, subject, body)

def send_verification_email(to_email: str, name: str, otp: str):
    subject = "Verify Your SmartLearn AI Account"
    content = f"""
    <p class="text">Hi {name},</p>
    <p class="text">Thank you for signing up. To complete your registration and activate your account, please use the verification code below:</p>
    <div style="background-color: #fff5f5; border: 1px solid #fee2e2; border-radius: 8px; padding: 28px; text-align: center; margin: 36px 0;">
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 700; letter-spacing: 12px; color: #ff3131;">{otp}</div>
    </div>
    <p class="text" style="font-size: 14px; color: #666666;">This code is valid for 15 minutes.</p>
    """
    warning = "If you didn't attempt to create an account, you can safely ignore this email."
    body = get_premium_template("Verify Your Account", content, show_warning=True, warning_text=warning)
    return send_email(to_email, subject, body)

def send_delete_account_otp_email(to_email: str, otp: str):
    subject = "⚠️ SmartLearn AI Account Deletion Request"
    content = f"""
    <p class="text">We received a request to permanently delete your account and all associated data. <strong>This action is irreversible.</strong></p>
    <p class="text">If you wish to proceed, please use the verification code below:</p>
    <div style="background-color: #fff5f5; border: 1px solid #fee2e2; border-radius: 8px; padding: 28px; text-align: center; margin: 36px 0;">
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 700; letter-spacing: 12px; color: #dc2626;">{otp}</div>
    </div>
    <p class="text" style="font-size: 14px; color: #666666;">This code is valid for 15 minutes.</p>
    """
    warning = "If you did not request this deletion, please ignore this email immediately and consider changing your password."
    body = get_premium_template("Account Deletion Request", content, show_warning=True, warning_text=warning)
    return send_email(to_email, subject, body)
