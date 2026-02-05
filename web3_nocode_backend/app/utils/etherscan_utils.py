# app/utils/etherscan_utils.py
from typing import Any, Dict, List, Optional
import httpx

# ✅ mapping explorer API (Etherscan-family)
ETHERSCAN_API_BASE = {
    "ethereum": "https://api.etherscan.io/api",
    "mainnet": "https://api.etherscan.io/api",
    "sepolia": "https://api-sepolia.etherscan.io/api",
    # Polygon
    "polygon": "https://api.polygonscan.com/api",
    # BSC
    "bsc": "https://api.bscscan.com/api",
    # Avalanche (SnowTrace a changé/peut être instable selon période)
    # Si tu n'as pas de clé/compat, tu peux l'enlever.
    "avalanche": "https://api.snowtrace.io/api",
}

LOCAL_NETWORKS = {"anvil", "local", "localhost", "hardhat"}


def _get_api_base(network: str) -> str:
    net = (network or "").lower()
    if net in ETHERSCAN_API_BASE:
        return ETHERSCAN_API_BASE[net]
    raise ValueError(f"Unsupported network for explorer API: {network}")


async def _etherscan_get(api_base: str, params: Dict[str, Any]) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(api_base, params=params)
        r.raise_for_status()
        return r.json()


async def get_wallet_balance(
    user_address: str,
    api_key: Optional[str],
    network: str = "sepolia",
) -> Optional[float]:
    """
    Retourne le solde en ETH (float) via API explorer (Etherscan/Polygonscan/Bscscan...).
    Pour anvil/local => None.
    """
    net = (network or "").lower()
    if net in LOCAL_NETWORKS:
        return None

    if not api_key:
        # pas de clé => on ne casse pas, mais on ne peut pas appeler l'API correctement
        raise ValueError("Missing ETHERSCAN_API_KEY (or equivalent)")

    api_base = _get_api_base(net)
    address = user_address.lower()

    data = await _etherscan_get(
        api_base,
        params={
            "module": "account",
            "action": "balance",
            "address": address,
            "tag": "latest",
            "apikey": api_key,
        },
    )

    # Etherscan renvoie status/message/result
    # result = string (wei)
    if str(data.get("status")) != "1":
        # Parfois status=0 mais message="No transactions found" => balance peut quand même être OK.
        # Ici balance: si pas "1" on renvoie erreur explicite
        raise ValueError(f"Explorer balance error: {data.get('message')} | {data.get('result')}")

    wei_str = data.get("result", "0")
    wei_int = int(wei_str)
    eth = wei_int / 10**18
    return eth


async def get_wallet_activity(
    user_address: str,
    network: str = "sepolia",
    api_key: Optional[str] = None,
    page: int = 1,
    offset: int = 20,
    sort: str = "desc",
) -> List[Dict[str, Any]]:
    """
    Retourne les txs 'normales' (list) via explorer API.
    Pour anvil/local => [].
    """
    net = (network or "").lower()
    if net in LOCAL_NETWORKS:
        return []

    if not api_key:
        raise ValueError("Missing ETHERSCAN_API_KEY (or equivalent)")

    api_base = _get_api_base(net)
    address = user_address.lower()

    data = await _etherscan_get(
        api_base,
        params={
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "page": page,
            "offset": offset,
            "sort": sort,
            "apikey": api_key,
        },
    )

    # Etherscan: status=0 message="No transactions found"
    if str(data.get("status")) == "0" and "No transactions" in str(data.get("message", "")):
        return []

    if str(data.get("status")) != "1":
        raise ValueError(f"Explorer txlist error: {data.get('message')} | {data.get('result')}")

    # result est une liste de tx objects
    return data.get("result", [])
