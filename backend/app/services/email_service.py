import os
from html import escape
import threading
import traceback
import requests
import secrets
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
from app.core.privacy import mask_email

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
        self.app_url = "https://communityai.co.in"
        
        # ULTRA-FAST: Use persistent session with connection pooling
        self.session = requests.Session()
        
        # Add HTTPAdapter for connection pooling and keep-alive
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry
        
        # Aggressive connection pooling for instant delivery
        adapter = HTTPAdapter(
            pool_connections=10,  # Keep 10 connections alive
            pool_maxsize=20,      # Max 20 connections in pool
            max_retries=Retry(total=2, backoff_factor=0.1, status_forcelist=[500, 502, 503, 504])
        )
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)
        
        self.session.headers.update({
            "api-key": self.api_key or "",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Connection": "keep-alive"  # Keep connections alive
        })
        
        if not self.api_key:
            print("\n⚠️ CRITICAL: BREVO_API_KEY not set in .env!")
            print("❌ Emails will be MOCKED (printed to console) instead of sending.\n")
    
    # ------------------------------------------------------------------
    # PUBLIC METHODS
    # ------------------------------------------------------------------
    
    def send_otp(self, user_email: str, otp: str, purpose: str = "google_login") -> bool:
        """Send a one-time code. purpose: "google_login" (default),
        "email_verification" or "password_reset"."""
        try:
            heading, _, purpose_label, minutes, intro = self._otp_details(purpose)
            subject = f"{otp} is your {self.company_name} verification code"
            html_body = self._generate_otp_html(otp, purpose, user_email)
            text_body = (
                f"{self.company_name} - {heading}\n\n{intro}\n\n"
                f"Your verification code: {otp}\n"
                f"Purpose: {purpose_label}\n"
                f"Valid for {minutes} minutes. Can be used only once.\n\n"
                f"Do not share this code with anyone. {self.company_name} staff will never ask for it.\n"
                f"If you did not make this request, you can ignore this email.\n\n"
                f"{self.company_name} is an independent information service, not a government website.\n"
                f"{self.app_url}"
            )
            self._dispatch_api(user_email, subject, html_body, priority=True, text_body=text_body)
            print(f"✅ OTP sent successfully to {mask_email(user_email)}")
            return True
        except Exception as e:
            print(f"❌ CRITICAL: OTP Email Failed for {mask_email(user_email)}: {str(e)}")
            return False

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


    def _worker_send_feedback(self, user_name: str, user_email: str, category: str, rating: int, message: str):
        """Background worker for feedback delivery"""
        try:
            subject = f"✨ New Feedback: {category} ({rating}/5 Stars)"
            html_body = self._generate_feedback_html(user_name, user_email, category, rating, message)
            self._dispatch_api(self.admin_email, subject, html_body)
            print(f"✅ Feedback sent to admin from {mask_email(user_email)}")
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

    def _dispatch_api(self, to_email: str, subject: str, html_body: str, priority: bool = False, text_body: str = None):
        """Internal dispatcher using Brevo HTTPS API with ULTRA-FAST deliverability"""
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
            "textContent": text_body or f"Your verification code is: {otp_val}."
        }
        
        # ULTRA-FAST: 3 seconds for OTP, 8 seconds for others
        timeout_duration = 3 if priority else 8
        
        try:
            # Use the pooled session for INSTANT delivery
            response = self.session.post(url, json=data, timeout=timeout_duration)
            if response.status_code not in [200, 201, 202]:
                print(f"⚠️ Email API Failure: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Dispatch Error: {str(e)}")
    
    # ------------------------------------------------------------------
    # HTML TEMPLATES
    # ------------------------------------------------------------------
    
    # Wording per purpose: (English heading, Hindi heading, purpose label,
    # minutes valid, intro). Minutes must match the expiry set in api/auth.py.
    _OTP_PURPOSES = {
        "email_verification": (
            "Confirm your email address", "ईमेल पता सत्यापन", "Email verification", 30,
            "Thank you for registering with Community AI. Enter the code below on the website to confirm your email address.",
        ),
        "password_reset": (
            "Reset your password", "पासवर्ड रीसेट", "Password reset", 15,
            "We received a request to reset the password for your Community AI account. Enter the code below to set a new password.",
        ),
        "google_login": (
            "Verify your sign-in", "साइन-इन सत्यापन", "Sign in with Google", 10,
            "Enter the code below on the website to complete your sign-in with Google.",
        ),
    }

    def _otp_details(self, purpose: str):
        return self._OTP_PURPOSES.get(purpose, self._OTP_PURPOSES["google_login"])

    def _generate_otp_html(self, otp: str, purpose: str = "google_login", to_email: str = "") -> str:
        """Formal, plain email (navy header, white body, no gradients or emoji)
        that renders the same in Gmail, Outlook and phone mail apps. Says
        clearly that Community AI is not a government service."""
        heading, heading_hi, purpose_label, minutes, intro = self._otp_details(purpose)
        issued = datetime.now(timezone(timedelta(hours=5, minutes=30))).strftime("%d %b %Y, %I:%M %p IST")
        year = datetime.now().year
        email_row = ""
        if to_email:
            email_row = f"""
                <tr>
                    <td style="padding:10px 14px;border-top:1px solid #e3e8f0;color:#5b6475;font-size:13px;width:38%;">Email address</td>
                    <td style="padding:10px 14px;border-top:1px solid #e3e8f0;color:#111827;font-size:13px;font-weight:600;word-break:break-all;">{escape(to_email)}</td>
                </tr>"""
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{heading} - {self.company_name}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f5;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">Your {self.company_name} code is {otp}. Valid for {minutes} minutes. Do not share it with anyone.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f5;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #d6dce5;">

    <!-- Header -->
    <tr>
        <td style="background-color:#0f1f3d;padding:18px 28px;border-bottom:4px solid #2350c4;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.2px;">{self.company_name}</p>
            <p style="margin:4px 0 0 0;color:#b9c6e0;font-size:12px;">Government scheme information, explained in your language</p>
        </td>
    </tr>

    <!-- Title -->
    <tr>
        <td style="padding:26px 28px 6px 28px;">
            <p style="margin:0;color:#5b6475;font-size:12px;text-transform:uppercase;letter-spacing:1px;">One-Time Password (OTP)</p>
            <h1 style="margin:6px 0 2px 0;color:#0f1f3d;font-size:22px;font-weight:bold;">{heading}</h1>
            <p style="margin:0;color:#5b6475;font-size:14px;">{heading_hi}</p>
        </td>
    </tr>

    <!-- Body -->
    <tr>
        <td style="padding:16px 28px 8px 28px;">
            <p style="margin:0 0 20px 0;color:#1f2937;font-size:15px;line-height:1.6;">{intro}</p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2350c4;background-color:#f4f7fd;">
                <tr>
                    <td align="center" style="padding:18px 12px;">
                        <p style="margin:0 0 8px 0;color:#1a367f;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
                        <p style="margin:0;color:#0f1f3d;font-size:34px;font-weight:bold;letter-spacing:10px;font-family:'Courier New',Courier,monospace;">{otp}</p>
                        <p style="margin:10px 0 0 0;color:#5b6475;font-size:13px;">Valid for <strong style="color:#111827;">{minutes} minutes</strong> &middot; can be used only once</p>
                    </td>
                </tr>
            </table>

            <!-- Request details -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0 0;border:1px solid #e3e8f0;">
                <tr>
                    <td style="padding:10px 14px;color:#5b6475;font-size:13px;width:38%;">Purpose</td>
                    <td style="padding:10px 14px;color:#111827;font-size:13px;font-weight:600;">{purpose_label}</td>
                </tr>{email_row}
                <tr>
                    <td style="padding:10px 14px;border-top:1px solid #e3e8f0;color:#5b6475;font-size:13px;">Requested on</td>
                    <td style="padding:10px 14px;border-top:1px solid #e3e8f0;color:#111827;font-size:13px;font-weight:600;">{issued}</td>
                </tr>
            </table>

            <!-- Security notice -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0 0;">
                <tr>
                    <td style="border-left:4px solid #b45309;background-color:#fff8eb;padding:14px 16px;">
                        <p style="margin:0 0 6px 0;color:#7c2d12;font-size:14px;font-weight:bold;">Do not share this code</p>
                        <p style="margin:0;color:#7c2d12;font-size:13px;line-height:1.55;">{self.company_name} staff will never ask for this code by phone, SMS, WhatsApp or email. Anyone asking for it may be trying to take over your account.<br>यह कोड किसी के साथ साझा न करें।</p>
                    </td>
                </tr>
            </table>

            <p style="margin:20px 0 0 0;color:#5b6475;font-size:13px;line-height:1.6;">If you did not make this request, you can ignore this email. Your account stays safe and no changes will be made.</p>
        </td>
    </tr>

    <!-- Help -->
    <tr>
        <td style="padding:18px 28px 24px 28px;">
            <p style="margin:0;padding-top:16px;border-top:1px solid #e3e8f0;color:#5b6475;font-size:13px;line-height:1.6;">
                Need help? Write to <a href="mailto:{self.admin_email}" style="color:#2350c4;">{self.admin_email}</a>
            </p>
        </td>
    </tr>

    <!-- Footer -->
    <tr>
        <td style="background-color:#f6f8fb;border-top:1px solid #d6dce5;padding:18px 28px;">
            <p style="margin:0 0 8px 0;color:#5b6475;font-size:12px;line-height:1.6;">
                {self.company_name} is an independent information service. It is not a government website and is not affiliated with any government department. Apply for schemes only through official government portals.
            </p>
            <p style="margin:0 0 8px 0;color:#5b6475;font-size:12px;">
                <a href="{self.app_url}" style="color:#2350c4;">communityai.co.in</a> &nbsp;|&nbsp;
                <a href="{self.app_url}/privacy" style="color:#2350c4;">Privacy Policy</a> &nbsp;|&nbsp;
                <a href="{self.app_url}/terms" style="color:#2350c4;">Terms</a>
            </p>
            <p style="margin:0;color:#8a93a3;font-size:11px;">This is an automated email. Please do not reply. &copy; {year} {self.company_name}</p>
        </td>
    </tr>

</table>
</td></tr>
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
