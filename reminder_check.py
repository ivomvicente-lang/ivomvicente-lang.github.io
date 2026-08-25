#!/usr/bin/env python3
"""Daily payment reminder — sends a macOS notification + optional email to yourself."""

import subprocess
import json
from datetime import datetime, timedelta
from pathlib import Path

REMIND_DAYS = 2
YOUR_EMAIL = "hello@albufeiracoworking.com"
YOUR_NAME = "Ivo"

CLIENTS = [
    {
        "name": "Pedro Taboada",
        "start": "2026-01-03",
        "history": [
            {"quarter": "2T", "sent": "2026-04-03"},
            {"quarter": "3T", "sent": "2026-06-03"},
        ],
    },
    {
        "name": "Marky",
        "start": "2026-03-10",
        "history": [
            {"quarter": "2T", "sent": "2026-06-10"},
        ],
    },
]


def next_renewal(start_str: str) -> datetime:
    start = datetime.strptime(start_str, "%Y-%m-%d")
    now = datetime.now()
    renewal = start
    while renewal <= now:
        renewal = renewal.replace(month=renewal.month + 3)
    return renewal


def days_until(dt: datetime) -> int:
    now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    return (dt - now).days


def quarter_label(start_str: str, renewal: datetime) -> str:
    q = (renewal.month - 1) // 3 + 1
    return f"{q}T"


def send_notification(title: str, message: str):
    script = f'display notification "{message}" with title "{title}"'
    subprocess.run(["osascript", "-e", script], check=True)


def send_email(subject: str, body: str):
    script = f'''
    tell application "Mail"
        set msg to make new outgoing message with properties {{subject:"{subject}", content:"{body}", visible:false}}
        tell msg
            make new to recipient at end of to recipients with properties {{address:"{YOUR_EMAIL}"}}
        end tell
        send msg
    end tell
    '''
    subprocess.run(["osascript", "-e", script], check=True)


def main():
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    reminders = []

    for client in CLIENTS:
        renewal = next_renewal(client["start"])
        days = days_until(renewal)
        q = quarter_label(client["start"], renewal)

        if days <= REMIND_DAYS:
            if days <= 0:
                urgency = "TODAY"
            elif days == 1:
                urgency = "TOMORROW"
            else:
                urgency = f"in {days} days"

            reminders.append({
                "name": client["name"],
                "renewal": renewal.strftime("%d %B %Y"),
                "quarter": q,
                "urgency": urgency,
            })

    if not reminders:
        send_notification(
            "Payment Reminders",
            "No payments due in the next 2 days. All clear!",
        )
        print("No reminders due. All clear.")
        return

    for r in reminders:
        title = f"⏰ PAYMENT DUE {r['urgency'].upper()}"
        msg = f"{r['name']} — {r['quarter']} renews {r['renewal']}"
        send_notification(title, msg)
        print(f"Notification sent: {title} — {msg}")

        # Also send email reminder to yourself
        subject = f"⏰ Reminder: Invoice {r['name']} — {r['quarter']}"
        body = (
            f"REMINDER — {r['name']}\n"
            f"Renewal date: {r['renewal']}\n"
            f"Status: {r['urgency']}\n\n"
            f"TODO:\n"
            f"1. Create invoice for {r['name']} ({r['quarter']})\n"
            f"2. Send invoice to client\n"
            f"3. Wait for payment\n"
            f"4. Send receipt"
        )
        send_email(subject, body)
        print(f"Email sent to {YOUR_EMAIL}")


if __name__ == "__main__":
    main()
