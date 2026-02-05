# app/config/networks.py
from pydantic import BaseModel
from typing import Optional

class NetworkConfig(BaseModel):
    name: str
    chain_id: int
    rpc_url: str
    explorer_api_base: Optional[str] = None
    explorer_api_key: Optional[str] = None

NETWORKS: dict[str, NetworkConfig] = {}
