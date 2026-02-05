from beanie import Document
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

class Deployment(Document):
    project_id: str
    user_id: str
    build_id: str
    chain: str
    tx_hash: str | None = None
    contract_address: str | None = None
    abi: list           # 👈 essentiel
    contract_type: str 
    status: str = "created"
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "deployments"


class ContractData(Document):
    name: str
    symbol: str
    supply: int
    decimals: int = 18



class DeploymentRecord(BaseModel):
    contract_address: str
    tx_hash: Optional[str] = None
    chain: str
    user_id: Optional[str] = None
    project_id: Optional[str] = None
    build_id: Optional[str] = None
    abi: List[dict]
    contract_type: str