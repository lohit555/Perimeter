import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from config import settings

_key = base64.b64decode(settings.encryption_key)


def encrypt_token(raw: str) -> str:
    nonce = os.urandom(12)
    ciphertext = AESGCM(_key).encrypt(nonce, raw.encode(), None)
    return f"{base64.b64encode(nonce).decode()}:{base64.b64encode(ciphertext).decode()}"


def decrypt_token(stored: str) -> str:
    nonce_b64, ciphertext_b64 = stored.split(":", 1)
    nonce = base64.b64decode(nonce_b64)
    ciphertext = base64.b64decode(ciphertext_b64)
    return AESGCM(_key).decrypt(nonce, ciphertext, None).decode()
