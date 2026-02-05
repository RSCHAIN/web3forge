# app/config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # ===== DB / Cache =====
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "web3_nocode")

    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

    # ===== Blockchain =====
    DEFAULT_NETWORK = os.getenv("DEFAULT_NETWORK", "anvil")

    # RPCs
    ANVIL_RPC = os.getenv("ANVIL_RPC", "http://127.0.0.1:8545")
    INFURA_KEY = os.getenv("INFURA_KEY", None)

    # Explorers
    ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY", None)
    POLYGONSCAN_API_KEY = os.getenv("POLYGONSCAN_API_KEY", None)
    BSCSCAN_API_KEY = os.getenv("BSCSCAN_API_KEY", None)
    SNOWTRACE_API_KEY = os.getenv("SNOWTRACE_API_KEY", None)

settings = Settings()
