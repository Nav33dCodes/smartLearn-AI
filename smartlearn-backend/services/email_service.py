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
    <html>
      <body>
        <h2>Welcome {name}!</h2>
        <p>We are thrilled to have you onboard.</p>
        <p>Start uploading PDFs and learning smarter today.</p>
      </body>
    </html>
    """
    return send_email(to_email, subject, body)

def send_otp_email(to_email: str, otp: str):
    subject = "Your SmartLearn AI Password Reset Code"
    body = f"""
    <html>
      <body>
        <h2>Password Reset</h2>
        <p>Your one-time password (OTP) to reset your password is:</p>
        <h1 style="letter-spacing: 5px; color: #10b981;">{otp}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </body>
    </html>
    """
    return send_email(to_email, subject, body)
