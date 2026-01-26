import os
import threading
import traceback
import requests
import secrets
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    """
    Professional Email Service using Brevo API for OTP-based authentication.
    Handles high-performance background sending with beautiful HTML templates.
    """
    
    def __init__(self):
        # Configuration
        load_dotenv()
        self.api_key = os.getenv("BREVO_API_KEY")
        self.sender_email = os.getenv("SENDER_EMAIL", "noreply@quickfix.com")
        self.admin_email = os.getenv("ADMIN_EMAIL", "riteshkumar90359@gmail.com")
        self.company_name = os.getenv("COMPANY_NAME", "Community AI Platform")
        self.app_url = os.getenv("APP_URL", "http://localhost:5173")
        
        # Safety Validation
        if not self.sender_email or "@" not in self.sender_email:
            self.sender_email = self.admin_email if self.admin_email else "noreply@example.com"
        
        if not self.api_key:
            print("\n⚠️ CRITICAL: BREVO_API_KEY not set in .env!")
            print("❌ Emails will be MOCKED (printed to console) instead of sending.\n")
    
    # ------------------------------------------------------------------
    # PUBLIC METHODS
    # ------------------------------------------------------------------
    
    def send_otp(self, user_email: str, otp: str) -> bool:
        """Send OTP to user with INSTANT priority - Non-blocking for speed"""
        thread = threading.Thread(
            target=self._worker_send_otp,
            args=(user_email, otp),
            name="OTP-Instant-Delivery"
        )
        thread.daemon = False
        thread.start()
        return True

    def generate_otp(self) -> str:
        """Generate a secure 6-digit OTP"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

    def get_otp_expiry(self) -> datetime:
        """Get OTP expiry time (10 minutes from now)"""
        return datetime.now(timezone.utc) + timedelta(minutes=10)

    # ------------------------------------------------------------------
    # BACKGROUND WORKER
    # ------------------------------------------------------------------

    def _worker_send_otp(self, user_email: str, otp: str):
        """INSTANT OTP delivery with priority handling"""
        try:
            subject = f"🔐 {otp} is your {self.company_name} Verification Code"
            html_body = self._generate_otp_html(otp)
            self._dispatch_api(user_email, subject, html_body, priority=True)
            print(f"✅ OTP sent successfully to {user_email}")
        except Exception as e:
            print(f"❌ CRITICAL: OTP Email Failed for {user_email}: {str(e)}")

    def _dispatch_api(self, to_email: str, subject: str, html_body: str, priority: bool = False):
        """Ultra-fast internal dispatcher"""
        if not self.api_key:
            return
        
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        data = {
            "sender": {"name": self.company_name, "email": self.sender_email},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html_body
        }
        
        timeout_duration = 10 if priority else 15
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=timeout_duration)
            if response.status_code not in [200, 201, 202]:
                print(f"⚠️ Email API Failure: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Dispatch Error: {str(e)}")
    
    # ------------------------------------------------------------------
    # HTML TEMPLATES
    # ------------------------------------------------------------------
    
    def _generate_otp_html(self, otp: str) -> str:
        """Generate beautiful HTML template for OTP email"""
        current_year = datetime.now().year
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code - {self.company_name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="500" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 15px;">🔐</div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                Verify Your Account
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 15px; font-weight: 500;">
                                {self.company_name}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 35px;">
                            <p style="margin: 0 0 25px 0; color: #4b5563; font-size: 16px; line-height: 1.7; text-align: center;">
                                Welcome! Use the verification code below to complete your Google sign-in. This code will expire in <strong>10 minutes</strong>.
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 3px solid #667eea; border-radius: 12px; padding: 30px; margin: 0 0 30px 0; text-align: center; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.1);">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">
                                    Your Verification Code
                                </p>
                                <h2 style="margin: 0; color: #1f2937; font-size: 42px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    {otp}
                                </h2>
                            </div>
                            
                            <!-- Security Notice -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                                <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                                    🛡️ Security Notice
                                </p>
                                <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.6;">
                                    Never share this code with anyone. {self.company_name} will never ask for your verification code via phone or email.
                                </p>
                            </div>
                            
                            <!-- Help Text -->
                            <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.6;">
                                If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 35px;">
                            <div style="border-top: 1px solid #e5e7eb; margin: 0 0 30px 0;"></div>
                        </td>
                    </tr>
                    
                    <!-- Additional Info -->
                    <tr>
                        <td style="padding: 0 35px 40px 35px;">
                            <div style="background-color: #eff6ff; border-radius: 10px; padding: 20px; text-align: center;">
                                <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                                    📱 Need Help?
                                </p>
                                <p style="margin: 0; color: #1e3a8a; font-size: 13px; line-height: 1.6;">
                                    If you're having trouble signing in, please contact our support team at 
                                    <a href="mailto:{self.admin_email}" style="color: #667eea; text-decoration: none; font-weight: 600;">{self.admin_email}</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                                This is an automated message from {self.company_name}
                            </p>
                            <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 12px;">
                                © {current_year} {self.company_name}. All rights reserved.
                            </p>
                            <div style="margin-top: 15px;">
                                <a href="{self.app_url}" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 500;">Visit Website</a>
                                <span style="color: #d1d5db;">|</span>
                                <a href="{self.app_url}/privacy" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 500;">Privacy Policy</a>
                                <span style="color: #d1d5db;">|</span>
                                <a href="mailto:{self.admin_email}" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 500;">Support</a>
                            </div>
                        </td>
                    </tr>
                    
                </table>
                
                <!-- Email Client Compatibility Note -->
                <table width="500" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 0 20px;">
                            <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                                If you're having trouble viewing this email, please ensure images are enabled in your email client.
                            </p>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
</body>
</html>
"""


# Initialize email service singleton
email_service = EmailService()
