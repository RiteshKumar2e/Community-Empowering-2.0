"""Helpers for keeping personal data out of logs."""


def mask_email(email: str) -> str:
    """ritesh@example.com -> ri***@example.com"""
    if not email or "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    return f"{local[:2]}***@{domain}"
