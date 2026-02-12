from fastapi import APIRouter, HTTPException, Query
from app.api.schemas.hello_storage import HelloStorageDeployRequest
from app.api.services.solidity_compiler import compile_contract
from app.config.networks import NETWORKS
from app.db.models.deployment import  DeploymentRecord, Deployment
from datetime import datetime
from web3 import Web3

router = APIRouter()


@router.post("/hello-storage")
async def prepare_hello_storage_deployment(
    data: HelloStorageDeployRequest
):
    network = data.network.lower()

    if network not in NETWORKS:
        raise HTTPException(400, f"Unsupported network: {network}")

    try:
        abi, bytecode = compile_contract(
            "app/api/contracts/hello.sol",
            "HelloStorage"
        )

        return {
            "abi": abi,
            "bytecode": bytecode,
            "constructorArgs": [data.initial_message],
        }

    except Exception as e:
        raise HTTPException(500, str(e))
    

@router.get("/hello-storage/read/message")
async def read_message(
    address: str = Query(...),
    network: str = Query("anvil"),
):
    if not Web3.is_address(address):
        raise HTTPException(400, "Invalid contract address")

    net = NETWORKS.get(network)
    if not net:
        raise HTTPException(400, "Unsupported network")

    abi, _ = compile_contract(
        "app/api/contracts/hello.sol",
        "HelloStorage"
    )

    w3 = Web3(Web3.HTTPProvider(net.rpc_url))
    contract = w3.eth.contract(address=address, abi=abi)

    try:
        value = contract.functions.message().call()
        return { "value": value }
    except Exception as e:
        raise HTTPException(500, str(e))
    
@router.post("/record_hello_storage")
async def record_hello_storage(data: DeploymentRecord):
    try:
        # On réutilise ton modèle Deployment (Beanie Document)
        record = Deployment(
            contract_address=data.contract_address,
            tx_hash=data.tx_hash,
            chain=data.chain,
            user_id=data.user_id.lower(),
            project_id=data.project_id or "lab001",
            build_id=data.build_id or "storage",
            status="deployed",
            abi=data.abi,
            contract_type="hello_storage", # 👈 Pour différencier de l'ERC20
            created_at=datetime.utcnow(),
        )
        await record.insert()
        return {"ok": True, "id": str(record.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hello-storage/abi")
async def get_storage_abi():
    """Version simplifiée pour le frontend"""
    try:
        abi, _ = compile_contract(
            "app/api/contracts/hello.sol",
            "HelloStorage"
        )
        return {"abi": abi}
    except Exception as e:
        raise HTTPException(500, detail=str(e))