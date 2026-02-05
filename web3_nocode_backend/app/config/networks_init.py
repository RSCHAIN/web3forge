# app/config/networks_init.py
from app.config.settings import settings
from app.config.networks import NETWORKS, NetworkConfig

def init_networks():
    NETWORKS.update({
        "anvil": NetworkConfig(
            name="anvil",
            chain_id=31337,
            rpc_url=settings.ANVIL_RPC,
            explorer_api_base=None,
            explorer_api_key=None,
        ),
        "sepolia": NetworkConfig(
            name="sepolia",
            chain_id=11155111,
            rpc_url=f"https://sepolia.infura.io/v3/{settings.INFURA_KEY}",
            explorer_api_base="https://api-sepolia.etherscan.io/api",
            explorer_api_key=settings.ETHERSCAN_KEY,
        ),
        "ethereum": NetworkConfig(
            name="ethereum",
            chain_id=1,
            rpc_url=f"https://mainnet.infura.io/v3/{settings.INFURA_KEY}",
            explorer_api_base="https://api.etherscan.io/api",
            explorer_api_key=settings.ETHERSCAN_KEY,
        ),
    })
