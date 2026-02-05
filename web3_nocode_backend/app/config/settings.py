# app/config/settings.py
# app/config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # ===== DB =====
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "web3_nocode")

    # ===== Redis =====
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

    # ===== Blockchain =====
    DEFAULT_NETWORK = os.getenv("DEFAULT_NETWORK", "anvil")

    ANVIL_RPC = os.getenv("ANVIL_RPC", "http://127.0.0.1:8545")
    INFURA_KEY = os.getenv("INFURA_KEY")

    ETHERSCAN_KEY = os.getenv("ETHERSCAN_API_KEY")

settings = Settings()

