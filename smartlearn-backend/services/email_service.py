import os
import resend

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY.strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

def send_email(to_email: str, subject: str, body: str, sender_prefix: str = "noreply"):
    if not resend.api_key:
        print(f"Warning: RESEND_API_KEY not set. Would have sent email to {to_email}: {subject}")
        return False
        
    try:
        if SMTP_EMAIL == "onboarding@resend.dev":
            from_address = f"SmartLearn AI <{SMTP_EMAIL}>"
        else:
            domain = SMTP_EMAIL.split('@')[-1] if '@' in SMTP_EMAIL else 'smartlearn.work'
            from_address = f"SmartLearn AI <{sender_prefix}@{domain}>"

        params = {
            "from": from_address,
            "to": [to_email],
            "subject": subject,
            "html": body
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Failed to send email via Resend: {e}")
        return False

def get_premium_template(title: str, content_html: str, show_warning: bool = False, warning_text: str = "") -> str:
    warning_block = f"""
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #27272a; color: #71717a; font-size: 13px; line-height: 20px;">
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
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #09090b;
                margin: 0;
                padding: 60px 20px;
                -webkit-font-smoothing: antialiased;
                color: #e4e4e7;
            }}
            .container {{
                max-width: 540px;
                margin: 0 auto;
                background-color: #121214;
                border: 1px solid #27272a;
                border-radius: 12px;
                padding: 48px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            }}
            .logo {{
                display: flex;
                align-items: center;
                margin-bottom: 40px;
                font-size: 24px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: -0.5px;
            }}
            .logo span {{
                color: #ff3131;
                margin-left: 4px;
            }}
            .title {{
                color: #ffffff;
                font-size: 24px;
                font-weight: 600;
                margin-top: 0;
                margin-bottom: 24px;
                letter-spacing: -0.5px;
            }}
            .text {{
                color: #a1a1aa;
                font-size: 15px;
                line-height: 26px;
                margin-bottom: 24px;
            }}
            .otp-box {{
                background-color: #18181b;
                border: 1px solid #3f3f46;
                border-radius: 8px;
                padding: 28px;
                text-align: center;
                margin: 36px 0;
            }}
            .otp-text {{
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 34px;
                font-weight: 700;
                letter-spacing: 12px;
                color: #ff3131;
                margin: 0;
            }}
            .btn {{
                background-color: #ff3131;
                color: #ffffff;
                font-weight: 600;
                font-size: 15px;
                text-decoration: none;
                padding: 14px 28px;
                border-radius: 8px;
                display: inline-block;
                box-shadow: 0 4px 16px rgba(255, 49, 49, 0.25);
                transition: opacity 0.2s;
            }}
            .footer {{
                text-align: center;
                margin-top: 40px;
                color: #52525b;
                font-size: 13px;
                line-height: 18px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="{FRONTEND_URL}/images/logo.svg" alt="Logo" width="28" height="28" style="margin-right: 12px;">
                SmartLearn<span>AI</span>
            </div>
            <h1 class="title">{title}</h1>
            {content_html}
            {warning_block}
        </div>
        <div class="footer">
            &copy; 2026 SmartLearn AI Inc. All rights reserved.<br>
            Strictly confidential & secure automated communication.
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
        <a href="{FRONTEND_URL}" class="btn">Get Started Now</a>
    </div>
    <p class="text" style="font-size: 14px;">If you have any questions or need assistance, simply reply to this email. We're here to help.</p>
    """
    body = get_premium_template("Welcome to SmartLearn!", content)
    return send_email(to_email, subject, body, sender_prefix="hello")

def send_otp_email(to_email: str, otp: str):
    subject = "Your SmartLearn AI Password Reset Code"
    content = f"""
    <p class="text">We received a request to reset the password associated with your account.</p>
    <p class="text">Please use the verification code below to securely reset your password:</p>
    <div class="otp-box">
        <div class="otp-text">{otp}</div>
    </div>
    <p class="text" style="font-size: 14px;">This code is valid for 15 minutes.</p>
    """
    warning = "If you did not request a password reset, please ignore this email or contact support immediately."
    body = get_premium_template("Password Reset Request", content, show_warning=True, warning_text=warning)
    return send_email(to_email, subject, body, sender_prefix="security")

def send_password_reset_success_email(to_email: str):
    subject = "Your SmartLearn AI Password Has Been Reset"
    content = """
    <p class="text">This email confirms that the password for your SmartLearn AI account has been successfully changed.</p>
    <p class="text">You can now log in to your account using your new password.</p>
    <div style="margin: 36px 0;">
        <a href="{FRONTEND_URL}/login" class="btn">Log In to Account</a>
    </div>
    """
    warning = "Security Notice: If you did not authorize this change, please contact our support team immediately."
    body = get_premium_template("Password Reset Successful", content, show_warning=True, warning_text=warning)
    return send_email(to_email, subject, body, sender_prefix="security")

def send_verification_email(to_email: str, name: str, otp: str):
    subject = "Verify Your SmartLearn AI Account"
    content = f"""
    <p class="text">Hi {name},</p>
    <p class="text">Thank you for signing up. To complete your registration and activate your account, please use the verification code below:</p>
    <div class="otp-box">
        <div class="otp-text">{otp}</div>
    </div>
    <p class="text" style="font-size: 14px;">This code is valid for 15 minutes.</p>
    """
    warning = "If you didn't attempt to create an account, you can safely ignore this email."
    body = get_premium_template("Verify Your Account", content, show_warning=True, warning_text=warning)
    return send_email(to_email, subject, body, sender_prefix="noreply")

def send_delete_account_otp_email(to_email: str, otp: str):
    subject = "⚠️ SmartLearn AI Account Deletion Request"
    content = f"""
    <p class="text">We received a request to permanently delete your account and all associated data. <strong>This action is irreversible.</strong></p>
    <p class="text">If you wish to proceed, please use the verification code below:</p>
    <div class="otp-box">
        <div class="otp-text" style="color: #dc2626;">{otp}</div>
    </div>
    <p class="text" style="font-size: 14px;">This code is valid for 15 minutes.</p>
    """
    warning = "If you did not request this deletion, please ignore this email immediately and consider changing your password."
    body = get_premium_template("Account Deletion Request", content, show_warning=True, warning_text=warning)
    return send_email(to_email, subject, body, sender_prefix="security")

def send_bug_report_email(user_email: str, user_name: str, bug_subject: str, bug_description: str):
    subject = f"🐛 Bug Report: {bug_subject}"
    
    content = f"""
    <p class="text"><strong>From:</strong> {user_name} ({user_email})</p>
    <p class="text"><strong>Subject:</strong> {bug_subject}</p>
    <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 8px; padding: 24px; margin: 32px 0;">
        <p class="text" style="color: #e4e4e7; margin: 0; white-space: pre-wrap;">{bug_description}</p>
    </div>
    <p class="text" style="font-size: 14px;">This bug report was submitted directly from the SmartLearn AI platform UI.</p>
    """
    
    body = get_premium_template("New Bug Report Received", content)
    
    # Send directly to the admin email
    admin_email = "iamnaveed.cs@gmail.com"
    return send_email(admin_email, subject, body, sender_prefix="support")
