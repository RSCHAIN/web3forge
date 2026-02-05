# app/api/schemas/hello_storage.py
from pydantic import BaseModel

class HelloStorageDeployRequest(BaseModel):
    network: str
    wallet_address: str
    initial_message: str
