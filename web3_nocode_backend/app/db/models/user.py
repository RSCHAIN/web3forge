from beanie import Document
from datetime import datetime

class User(Document):
    email: str | None = None
    siwe_address: str | None = None
    plan: str = "free"
    created_at: datetime = datetime.utcnow()
    last_login: datetime | None = None  # 👈 ajoute ceci

    class Settings:
        name = "users"
