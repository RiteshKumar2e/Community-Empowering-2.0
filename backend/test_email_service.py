"""
Test script for Email Service with Brevo API
Run this to test if your email configuration is working correctly
"""

from app.services.email_service import email_service
import time

def test_email_service():
    """Test the email service configuration"""
    
    print("\n" + "="*60)
    print("  EMAIL SERVICE TEST")
    print("="*60 + "\n")
    
    # Check configuration
    print("[1] Checking Configuration...")
    print(f"    Brevo API Key: {'SET' if email_service.api_key else 'NOT SET'}")
    print(f"    Sender Email: {email_service.sender_email}")
    print(f"    Admin Email: {email_service.admin_email}")
    print(f"    Company Name: {email_service.company_name}")
    print(f"    App URL: {email_service.app_url}")
    
    if not email_service.api_key:
        print("\n[ERROR] Brevo API Key is not set!")
        print("Please set BREVO_API_KEY in your .env file")
        return False
    
    print("\n[2] Testing OTP Generation...")
    otp = email_service.generate_otp()
    print(f"    Generated OTP: {otp}")
    print(f"    OTP Length: {len(otp)} digits")
    
    if len(otp) != 6 or not otp.isdigit():
        print("[ERROR] OTP generation failed!")
        return False
    print("    [OK] OTP generation working correctly")
    
    print("\n[3] Testing OTP Expiry Calculation...")
    expiry = email_service.get_otp_expiry()
    print(f"    Expiry Time: {expiry}")
    print("    [OK] Expiry calculation working")
    
    # Ask user if they want to send a test email
    print("\n[4] Email Sending Test")
    test_email = input("    Enter your email to receive a test OTP (or press Enter to skip): ").strip()
    
    if test_email and "@" in test_email:
        print(f"\n    [STEP] Sending test OTP to {test_email}...")
        test_otp = email_service.generate_otp()
        success = email_service.send_otp(test_email, test_otp)
        
        print(f"    [INFO] OTP to send: {test_otp}")
        print("    [DEBUG] Check console for worker thread output...")
        
        # Keep main thread alive to see worker output
        for i in range(10):
            print(f"    Checking for delivery... {10-i}s", end="\r")
            time.sleep(1)
        print("\n    [DONE] Test sequence finished.")
    else:
        print("    [SKIPPED] Email sending test skipped")
    
    print("\n" + "="*60)
    print("  TEST COMPLETED SUCCESSFULLY!")
    print("="*60 + "\n")
    
    return True

if __name__ == "__main__":
    try:
        success = test_email_service()
        if not success:
            print("\n[ERROR] Some tests failed. Please check the configuration.\n")
            exit(1)
    except Exception as e:
        print(f"\n[ERROR] Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
