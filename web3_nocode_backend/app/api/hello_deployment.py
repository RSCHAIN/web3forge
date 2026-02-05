from fastapi import APIRouter, HTTPException, Query
from app.api.schemas.hello_storage import HelloStorageDeployRequest
from app.api.services.solidity_compiler import compile_contract
from app.config.networks import NETWORKS
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