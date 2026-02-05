
from datetime import datetime, timedelta
from beanie import Document

class Nonce(Document):
    value: str
    created_at: datetime = datetime.utcnow()

    def is_expired(self):
        return datetime.utcnow() > self.created_at + timedelta(minutes=5)
