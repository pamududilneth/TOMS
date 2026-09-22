import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)


def send_report_email(to_email: str, client_name: str, excel_path: str):
    if not (SMTP_HOST and SMTP_USER and SMTP_PASSWORD):
        raise RuntimeError(
            "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD "
            "in toms-backend/.env before sharing incidents with clients."
        )

    msg = EmailMessage()
    msg["Subject"] = f"TOMS Incident Report — {client_name}"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg.set_content(
        f"Hi {client_name},\n\n"
        "Attached is your incident report from TOMS. This file will keep "
        "being updated on our end as new incidents are logged for your account, "
        "so you can expect it to grow over time without further emails.\n\n"
        "Regards,\nOperations Team"
    )

    with open(excel_path, "rb") as f:
        msg.add_attachment(
            f.read(),
            maintype="application",
            subtype="vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=os.path.basename(excel_path),
        )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)


def send_report_link_email(to_email: str, client_name: str, share_link: str):
    if not (SMTP_HOST and SMTP_USER and SMTP_PASSWORD):
        raise RuntimeError(
            "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD "
            "in toms-backend/.env"
        )

    msg = EmailMessage()
    msg["Subject"] = f"Your Live TOMS Incident Report — {client_name}"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg.set_content(
        f"Hi {client_name},\n\n"
        "Here is your live incident report:\n"
        f"{share_link}\n\n"
        "This link always shows the latest data — we'll keep it updated as new "
        "incidents are logged for your account, so bookmark it instead of "
        "waiting for another email.\n\n"
        "Regards,\nOperations Team"
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)