"""Security and authentication utilities for Note2Visual."""

import hmac
import hashlib
import secrets
import json
import base64
import time
from typing import Optional
from app.core.config import settings

# Salt length and iterations for PBKDF2-HMAC-SHA256
SALT_BYTES = 16
HASH_ITERATIONS = 100_000


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a unique random salt."""
    salt = secrets.token_bytes(SALT_BYTES)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        HASH_ITERATIONS
    )
    salt_b64 = base64.b64encode(salt).decode("utf-8")
    key_b64 = base64.b64encode(key).decode("utf-8")
    return f"pbkdf2:sha256:{HASH_ITERATIONS}${salt_b64}${key_b64}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored PBKDF2 hash."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 3:
            return False
        
        algorithm_iterations, salt_b64, expected_key_b64 = parts
        iterations = int(algorithm_iterations.split(":")[2])
        salt = base64.b64decode(salt_b64)
        expected_key = base64.b64decode(expected_key_b64)

        computed_key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt,
            iterations
        )
        return hmac.compare_digest(computed_key, expected_key)
    except Exception:
        return False


def create_access_token(user_id: str, email: str, expires_in_seconds: int = 86400 * 30) -> str:
    """Generate a signed URL-safe JWT-like token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "exp": int(time.time()) + expires_in_seconds
    }
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = hmac.new(
        settings.secret_key.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[dict]:
    """Validate token signature and expiry, returning the payload if valid."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        # Verify signature
        expected_sig = hmac.new(
            settings.secret_key.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        
        # Add padding back for decoding
        rem = len(sig_b64) % 4
        sig_padded = sig_b64 + ("=" * (4 - rem) if rem else "")
        provided_sig = base64.urlsafe_b64decode(sig_padded)

        if not hmac.compare_digest(expected_sig, provided_sig):
            return None

        # Decode payload
        rem_p = len(payload_b64) % 4
        payload_padded = payload_b64 + ("=" * (4 - rem_p) if rem_p else "")
        payload = json.loads(base64.urlsafe_b64decode(payload_padded).decode())

        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None
