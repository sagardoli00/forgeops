import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

try:
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(SMTP_USER, SMTP_PASS)
    print("✅ SMTP Login Successful")
    server.quit()
except Exception as e:
    print("❌ SMTP Login Failed")
    print(e)