import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

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

def send_welcome_email(to_email: str, name: str):
    subject = "Welcome to SmartLearn AI!"
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
            .header {{ background-color: #0a0a0a; padding: 30px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }}
            .header span {{ color: #10b981; }}
            .content {{ padding: 40px 30px; }}
            .content h2 {{ color: #18181b; margin-top: 0; font-size: 20px; }}
            .content p {{ color: #52525b; line-height: 1.6; font-size: 16px; }}
            .btn-container {{ text-align: center; margin: 35px 0; }}
            .btn {{ background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; }}
            .footer {{ background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #e4e4e7; }}
            .footer p {{ color: #a1a1aa; font-size: 13px; margin: 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SmartLearn <span>AI</span></h1>
            </div>
            <div class="content">
                <h2>Welcome to the future of learning, {name}!</h2>
                <p>We're thrilled to have you onboard. SmartLearn AI is designed to help you digest information faster, understand complex topics effortlessly, and unlock your true learning potential.</p>
                <p>Upload your PDFs, ask questions, and let our advanced Retrieval-Augmented Generation engine do the heavy lifting.</p>
                <div class="btn-container">
                    <a href="https://smartlearn-ai-production.up.railway.app" class="btn">Get Started Now</a>
                </div>
                <p>If you have any questions, simply reply to this email. We're here to help!</p>
            </div>
            <div class="footer">
                <p>&copy; {{{{ year }}}} SmartLearn AI. All rights reserved.</p>
                <p>You received this email because you signed up for a SmartLearn AI account.</p>
            </div>
        </div>
    </body>
    </html>
    """.replace("{{ year }}", "2026")
    return send_email(to_email, subject, body)

def send_otp_email(to_email: str, otp: str):
    subject = "Your SmartLearn AI Password Reset Code"
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
            .header {{ background-color: #0a0a0a; padding: 30px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }}
            .header span {{ color: #10b981; }}
            .content {{ padding: 40px 30px; }}
            .content h2 {{ color: #18181b; margin-top: 0; font-size: 20px; }}
            .content p {{ color: #52525b; line-height: 1.6; font-size: 16px; }}
            .otp-container {{ background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }}
            .otp-code {{ color: #10b981; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; }}
            .warning {{ color: #71717a; font-size: 14px; margin-top: 30px; border-top: 1px solid #e4e4e7; padding-top: 20px; }}
            .footer {{ background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #e4e4e7; }}
            .footer p {{ color: #a1a1aa; font-size: 13px; margin: 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SmartLearn <span>AI</span></h1>
            </div>
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset the password associated with your SmartLearn AI account. Please use the verification code below to securely reset your password:</p>
                <div class="otp-container">
                    <p class="otp-code">{otp}</p>
                </div>
                <p><strong>Note:</strong> This code is only valid for the next 15 minutes.</p>
                <p class="warning">If you did not request a password reset, please ignore this email or contact support if you have concerns regarding your account security.</p>
            </div>
            <div class="footer">
                <p>&copy; {{{{ year }}}} SmartLearn AI. All rights reserved.</p>
                <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """.replace("{{ year }}", "2026")
    return send_email(to_email, subject, body)

def send_password_reset_success_email(to_email: str):
    subject = "Your SmartLearn AI Password Has Been Reset"
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 0; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
            .header {{ background-color: #0a0a0a; padding: 30px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }}
            .header span {{ color: #10b981; }}
            .content {{ padding: 40px 30px; }}
            .content h2 {{ color: #18181b; margin-top: 0; font-size: 20px; }}
            .content p {{ color: #52525b; line-height: 1.6; font-size: 16px; }}
            .success-icon {{ background-color: #d1fae5; color: #10b981; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px auto; }}
            .btn-container {{ text-align: center; margin: 35px 0; }}
            .btn {{ background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; }}
            .footer {{ background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #e4e4e7; }}
            .footer p {{ color: #a1a1aa; font-size: 13px; margin: 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SmartLearn <span>AI</span></h1>
            </div>
            <div class="content">
                <div style="text-align: center;">
                    <div class="success-icon" style="font-size: 40px; line-height: 64px;">✓</div>
                </div>
                <h2 style="text-align: center;">Password Reset Successful</h2>
                <p>This email is to confirm that the password for your SmartLearn AI account has been successfully changed.</p>
                <p>If you made this change, you don't need to do anything else. You can now log in using your new password.</p>
                <div class="btn-container">
                    <a href="https://smartlearn-ai-production.up.railway.app/login" class="btn">Log In Now</a>
                </div>
                <p><strong>Security Notice:</strong> If you did not authorize this change, please contact our support team immediately to secure your account.</p>
            </div>
            <div class="footer">
                <p>&copy; {{{{ year }}}} SmartLearn AI. All rights reserved.</p>
                <p>This is an automated security alert. Please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """.replace("{{ year }}", "2026")
    return send_email(to_email, subject, body)
