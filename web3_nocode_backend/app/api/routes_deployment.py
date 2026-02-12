from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from app.db.models.deployment import DeploymentRecord, Deployment
from app.utils.etherscan_utils import (
    get_wallet_balance,
    get_wallet_activity,
)
from app.api.services.solidity_compiler import compile_contract
from app.config.settings import settings

router = APIRouter()


import traceback
from fastapi import HTTPException

@router.post("/prepare_erc20")
async def prepare_erc20(data: dict):
    try:
        abi, bytecode = compile_contract(
            "app/api/contracts/erc20_openzeppelin.sol",
            "MyToken"
        )

        return {
            "abi": abi,
            "bytecode": bytecode,
            "standard": "ERC20",
            "openzeppelin": True
        }

    except Exception as e:
        print("❌ ERC20 compilation error")
        print(traceback.format_exc())  # 👈 TRACEBACK COMPLET
        raise HTTPException(
            status_code=500,
            detail={
                "error": str(e),
                "type": type(e).__name__,
            }
        )




@router.post("/record_erc20")
async def record_deployment(data: DeploymentRecord):
    try:
        # 1️⃣ Sauvegarde du déploiement (TOUJOURS)
        record = Deployment(
            contract_address=data.contract_address,
            tx_hash=data.tx_hash,
            chain=data.chain,
            user_id=data.user_id.lower() or "unknown",
            project_id=data.project_id or "nocode",
            build_id=data.build_id or "auto",
            status="deployed",
            abi=data.abi,
            contract_type="erc20",
            created_at=datetime.utcnow(),
        )
        await record.insert()

        print(f"✅ Deployment saved on {data.chain}: {data.contract_address}")

        # 2️⃣ Vérification Etherscan (OPTIONNELLE)
        etherscan_result = None
        chain = (data.chain or "").lower()

        if chain not in ["anvil", "local", "localhost"]:
            try:
                # ⚠️ Appel uniquement si la fonction existe vraiment
                etherscan_result = await verify_contract_on_etherscan(
                    address=data.contract_address,
                    source_code=(
                        "// SPDX-License-Identifier: MIT\n"
                        "pragma solidity ^0.8.20;\n"
                        "contract Token {}"
                    ),
                    contract_name="Token",
                    compiler_version="0.8.20",
                    network=chain,
                )
                print("🔍 Etherscan verification:", etherscan_result)

            except NameError:
                # Fonction pas encore implémentée → on skip proprement
                etherscan_result = {
                    "status": "skipped",
                    "reason": "verify_contract_on_etherscan not implemented",
                }

            except Exception as verify_error:
                # La vérification ne doit JAMAIS bloquer le déploiement
                etherscan_result = {
                    "status": "failed",
                    "error": str(verify_error),
                }

        # 3️⃣ Réponse API (toujours OK si on arrive ici)
        return {
            "ok": True,
            "id": str(record.id),
            "etherscan": etherscan_result,
        }

    except Exception as e:
        print(f"❌ Error during deployment save: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/byUser/{user_address}")
async def get_deployments_by_user(
    user_address: str,
    network: str = Query("anvil"),
):
    try:
        # 🔐 Normalisation
        user_address = user_address.lower()
        network = network.lower()

        # 🧱 MongoDB
        # Dans ton endpoint GET /byUser/{user_address}
        deployments = await Deployment.find(
            Deployment.user_id == user_address,
            Deployment.chain == network # 👈 Ajoute ce filtre
        ).to_list()

        # 🏠 LOCAL / ANVIL → PAS d’Etherscan
        if network in {"anvil", "local", "localhost"}:
            return {
                "address": user_address,
                "network": network,
                "balance": None,
                "deployments": deployments,
                "transactions": [],
            }

        # 🌍 Réseaux supportés Etherscan
        if network not in {"sepolia", "ethereum", "polygon", "bsc", "avalanche"}:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported network: {network}",
            )

        # 💰 Balance
        balance = await get_wallet_balance(
            user_address=user_address,
            api_key=settings.ETHERSCAN_API_KEY,
            network=network,
        )

        # 🔄 Transactions
        transactions = await get_wallet_activity(
            user_address=user_address,
            network=network,
        )

        return {
            "address": user_address,
            "network": network,
            "balance": balance,
            "deployments": deployments,
            "transactions": transactions,
        }

    except HTTPException:
        raise
    except Exception as e:
        print("❌ get_deployments_by_user error:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/contract/{address}")
async def get_contract(address: str):
    contract = await Deployment.find_one(
        Deployment.contract_address == address
    )
    if not contract:
        raise HTTPException(404, "Contract not found")
    return contract
