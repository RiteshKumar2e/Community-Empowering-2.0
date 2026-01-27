import os
import threading
import traceback
import requests
import secrets
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings

class EmailService:
    """
    Professional Email Service using Brevo API for OTP-based authentication.
    Handles high-performance background sending with beautiful HTML templates.
    """
    
    def __init__(self):
        # Configuration
        self.api_key = settings.BREVO_API_KEY
        self.admin_email = "riteshkumar90359@gmail.com"
        self.sender_email = self.admin_email
        self.company_name = "Community AI"
        self.app_url = "https://community-empowering-2-0.vercel.app"
        
        # Use a persistent session for better performance (connection pooling)
        self.session = requests.Session()
        self.session.headers.update({
            "api-key": self.api_key or "",
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
        
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

    def send_feedback_to_admin(self, user_name: str, user_email: str, category: str, rating: int, message: str) -> bool:
        """Send user feedback to admin with detailed template"""
        thread = threading.Thread(
            target=self._worker_send_feedback,
            args=(user_name, user_email, category, rating, message),
            name="Feedback-Delivery"
        )
        thread.daemon = False
        thread.start()
        return True

    def send_market_update_notification(self, new_items: list) -> bool:
        """Notify admin about automatically discovered market opportunities"""
        thread = threading.Thread(
            target=self._worker_send_market_update,
            args=(new_items,),
            name="Market-Update-Notification"
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

    def _worker_send_feedback(self, user_name: str, user_email: str, category: str, rating: int, message: str):
        """Background worker for feedback delivery"""
        try:
            subject = f"✨ New Feedback: {category} ({rating}/5 Stars)"
            html_body = self._generate_feedback_html(user_name, user_email, category, rating, message)
            self._dispatch_api(self.admin_email, subject, html_body)
            print(f"✅ Feedback sent to admin from {user_email}")
        except Exception as e:
            print(f"❌ Feedback Email Failed: {str(e)}")

    def _worker_send_market_update(self, new_items: list):
        """Background worker for market discovery notification"""
        try:
            count = len(new_items)
            subject = f"🚀 Market Insight: {count} New Opportunities Added Automatically"
            html_body = self._generate_market_update_html(new_items)
            self._dispatch_api(self.admin_email, subject, html_body)
            print(f"✅ Market update notification sent to admin")
        except Exception as e:
            print(f"❌ Market Update Email Failed: {str(e)}")

    def _dispatch_api(self, to_email: str, subject: str, html_body: str, priority: bool = False):
        """Internal dispatcher using Brevo HTTPS API with better deliverability"""
        if not self.api_key:
            return
        
        url = "https://api.brevo.com/v3/smtp/email"
        
        # Extract OTP from subject or body for plain text fallback
        import re
        otp_match = re.search(r'\d{6}', subject)
        otp_val = otp_match.group(0) if otp_match else "your code"
        
        data = {
            "sender": {"name": self.company_name, "email": self.sender_email},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html_body,
            "textContent": f"Your verification code is: {otp_val}. This code expires in 10 minutes."
        }
        
        timeout_duration = 10 if priority else 15
        
        try:
            # Use the pooled session for faster delivery
            response = self.session.post(url, json=data, timeout=timeout_duration)
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

    def _generate_feedback_html(self, user_name: str, user_email: str, category: str, rating: int, message: str) -> str:
        """Generate professional HTML template for Feedback"""
        current_year = datetime.now().year
        stars_html = "⭐" * rating
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Feedback Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">New Feedback Received</h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Community AI Growth & Insights</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="margin-bottom: 32px;">
                                <h3 style="margin: 0 0 16px 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">User Profile</h3>
                                <table width="100%" style="background-color: #f1f5f9; border-radius: 12px; padding: 16px;">
                                    <tr>
                                        <td style="padding-bottom: 8px;"><strong style="color: #475569;">Name:</strong></td>
                                        <td style="padding-bottom: 8px; color: #1e293b;">{user_name}</td>
                                    </tr>
                                    <tr>
                                        <td><strong style="color: #475569;">Email:</strong></td>
                                        <td style="color: #6366f1;">{user_email}</td>
                                    </tr>
                                </table>
                            </div>

                            <div style="margin-bottom: 32px;">
                                <h3 style="margin: 0 0 16px 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Submission Details</h3>
                                <div style="display: flex; gap: 20px;">
                                    <div style="flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                                        <div style="font-size: 12px; color: #64748b;">Category</div>
                                        <div style="font-size: 16px; font-weight: 600; color: #4f46e5;">{category}</div>
                                    </div>
                                    <div style="flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                                        <div style="font-size: 12px; color: #64748b;">Rating</div>
                                        <div style="font-size: 16px; font-weight: 600; color: #f59e0b;">{stars_html} ({rating}/5)</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style="margin: 0 0 16px 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">The Message</h3>
                                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #334155; line-height: 1.6; font-style: italic;">
                                    "{message}"
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                This feedback was submitted via the Community AI Dashboard.<br>
                                © {current_year} {self.company_name} Admin Panel
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


    def _generate_market_update_html(self, items: list) -> str:
        """Generate beautiful HTML for market discovery updates"""
        current_year = datetime.now().year
        items_html = ""
        for item in items:
            items_html = items_html + f"""
            <div style="background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">{item.get('title')}</h4>
                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; line-height: 1.5;">{item.get('description', '')[:150]}...</p>
                <div style="display: flex; gap: 15px;">
                    <span style="font-size: 12px; font-weight: 600; color: #4f46e5; text-transform: uppercase;">Category: {item.get('category')}</span>
                    <a href="{item.get('link')}" style="font-size: 12px; font-weight: 600; color: #10b981; text-decoration: none;">Source →</a>
                </div>
            </div>
            """

        return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f0f4f8;">
    <table width="100%" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden;">
                    <tr>
                        <td style="background: #0f172a; padding: 40px; text-align: center; color: white;">
                            <h2>Market Scanner Report</h2>
                            <p>Real-time resource discovery</p>
                        </td>
                    </tr>
                    <tr><td style="padding: 40px;">{items_html}</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

# Initialize email service singleton
email_service = EmailService()
