from beanie import Document
from datetime import datetime
from typing import Dict

class Event(Document):
    deployment_id: str
    event_name: str
    args: Dict
    block_number: int
    tx_hash: str
    timestamp: datetime = datetime.utcnow()

    class Settings:
        name = "events"
