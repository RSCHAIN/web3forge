# --- Models ---
from pydantic import BaseModel

class VerifyPayload(BaseModel):
    message: str
    signature: str