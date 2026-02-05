from beanie import Document
from datetime import datetime
from typing import Dict

class Template(Document):
    name: str
    category: str
    version: str
    schema: Dict
    audited: bool = False
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "templates"
