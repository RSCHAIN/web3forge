# app/api/routes_dashboard.py
from fastapi import APIRouter, HTTPException
from app.db.models.user import User
from app.db.models.deployment import Deployment, DeploymentRecord
from beanie import PydanticObjectId
from web3 import Web3
from app.utils.etherscan_utils import get_wallet_activity
from fastapi import Query


router = APIRouter()

ERC20_TRANSFER_EVENT = {
    "anonymous": False,
    "inputs": [
        {"indexed": True, "name": "from", "type": "address"},
        {"indexed": True, "name": "to", "type": "address"},
        {"indexed": False, "name": "value", "type": "uint256"},
    ],
    "name": "Transfer",
    "type": "event",
}


# 🌐 RPC endpoints supportés
NETWORK_RPC = {
    "anvil": "http://127.0.0.1:8545",
    "ethereum": "https://mainnet.infura.io/v3/388983b8720e4493844f9ac9ba1f725c",
    "sepolia": "https://sepolia.infura.io/v3/388983b8720e4493844f9ac9ba1f725c",
    "polygon": "https://polygon-rpc.com",
    "bsc": "https://bsc-dataseed.binance.org",
    "avalanche": "https://api.avax.network/ext/bc/C/rpc",
}



@router.get("/user/{user_id}")
async def get_user_dashboard_by_id(user_id: str):
    """
    Retourne les infos de profil + statistiques de déploiement pour la dashboard utilisateur.
    """
    user = await User.find_one(User.id == PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    deployments = await Deployment.find(Deployment.user_id == user_id).to_list()

    # Statistiques
    total_deployments = len(deployments)
    by_chain = {}
    for dep in deployments:
        by_chain[dep.chain] = by_chain.get(dep.chain, 0) + 1

    last_deployment = max(deployments, key=lambda d: d.created_at, default=None)

    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "address": getattr(user, "wallet", None),
            "createdAt": user.createdAt,
        },
        "stats": {
            "total_deployments": total_deployments,
            "by_chain": by_chain,
            "last_deployment": last_deployment.contract_address if last_deployment else None,
        },
        "deployments": [
            {
                "address": d.contract_address,
                "chain": d.chain,
                "tx_hash": d.tx_hash,
                "status": d.status,
                "created_at": d.created_at,
            }
            for d in deployments
        ],
    }


@router.get("/byUser/{address}")
async def get_user_dashboard_by_wallet(address: str, network: str = "sepolia"):
    """
    Retourne :
    - Le solde ETH du wallet
    - Les déploiements du user
    - Les transactions récentes (Etherscan)
    """
    try:
        # ✅ Étape 1 — Vérifier le réseau
        rpc_url = NETWORK_RPC.get(network.lower())
        if not rpc_url:
            raise HTTPException(status_code=400, detail=f"Unsupported network: {network}")

        # ✅ Étape 2 — Connexion Web3
        web3 = Web3(Web3.HTTPProvider(rpc_url))
        if not web3.is_connected():
            raise HTTPException(status_code=500, detail=f"Cannot connect to {network} RPC")

        # ✅ Étape 3 — Récupération du solde
        balance_wei = web3.eth.get_balance(address)
        balance_eth = web3.from_wei(balance_wei, "ether")

        # ✅ Étape 4 — Récupération des déploiements depuis Mongo
        deployments = await DeploymentRecord.find(DeploymentRecord.user_id == address).to_list()

        # ✅ Étape 5 — Récupération des transactions depuis Etherscan
        transactions = await get_wallet_activity(address, network=network)

        return {
            "address": address,
            "network": network,
            "balance": float(balance_eth),
            "deployments": [d.dict() for d in deployments],
            "transactions": transactions,
        }

    except Exception as e:
        print(f"❌ Error in get_user_dashboard_by_wallet: {e}")
        raise HTTPException(status_code=500, detail=str(e))


ERC20_TRANSFER_TOPIC = Web3.keccak(
    text="Transfer(address,address,uint256)"
)

@router.get("/contract/transactions")
async def get_contract_transactions(
    contract_address: str,
    network: str = Query("anvil"),
    limit: int = Query(20),
):
    try:
        rpc_url = NETWORK_RPC.get(network.lower())
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        checksum_address = Web3.to_checksum_address(contract_address)
        
        logs = w3.eth.get_logs({
            "fromBlock": 0,
            "toBlock": "latest",
            "address": checksum_address,
            "topics": [ERC20_TRANSFER_TOPIC],
        })

        txs = []
        # On limite avant la boucle pour éviter de trop solliciter le RPC
        target_logs = list(reversed(logs))[:limit]

        for log in target_logs:
            try:
                # 1. Récupération du Reçu (Transaction Receipt) pour le Gas
                receipt = w3.eth.get_transaction_receipt(log["transactionHash"])
                
                # 2. Récupération du Bloc pour le Timestamp et le Hash du bloc
                block_info = w3.eth.get_block(log["blockNumber"])
                
                # Conversion du timestamp en format lisible (ISO ou string)
                from datetime import datetime
                dt_object = datetime.fromtimestamp(block_info["timestamp"])
                formatted_time = dt_object.strftime("%a, %d %b %Y %H:%M:%S +0000")

                # Extraction des adresses et valeurs
                from_addr = "0x" + log["topics"][1].hex()[-40:]
                to_addr   = "0x" + log["topics"][2].hex()[-40:]
                data_hex = log["data"].hex() if isinstance(log["data"], bytes) else log["data"]
                value = int(data_hex, 16) if data_hex and data_hex != '0x' else 0

                txs.append({
                    "tx_hash": log["transactionHash"].hex(),
                    "from": Web3.to_checksum_address(from_addr),
                    "to": Web3.to_checksum_address(to_addr),
                    "value": str(value),
                    "block": log["blockNumber"],
                    "block_hash": log["blockHash"].hex(),
                    "block_time": formatted_time,
                    "gas_used": receipt["gasUsed"] # <--- Le champ manquant est ici
                })
            except Exception as e:
                print(f"⚠️ Error enriching log: {e}")
                continue

        return {
            "contract": checksum_address,
            "network": network,
            "transactions": txs
        }

    except Exception as e:
        raise HTTPException(500, f"Blockchain Error: {str(e)}")