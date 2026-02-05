from beanie import Document
from datetime import datetime
from typing import Dict

class Build(Document):
    template_id: str
    user_id: str
    params: Dict
    status: str = "pending"
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "builds"
