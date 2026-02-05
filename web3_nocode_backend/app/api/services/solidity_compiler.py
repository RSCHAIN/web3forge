# app/utils/solidity_compiler.py

from solcx import compile_standard, install_solc
from pathlib import Path

SOLC_VERSION = "0.8.20"
install_solc(SOLC_VERSION)

def compile_contract(contract_path: str, contract_name: str):
    contract_path = Path(contract_path)

    if not contract_path.exists():
        raise FileNotFoundError(f"Contract not found: {contract_path}")

    source = contract_path.read_text()

    compiled = compile_standard(
        {
            "language": "Solidity",
            "sources": {
                contract_path.name: {
                    "content": source
                }
            },
            "settings": {
                "optimizer": {"enabled": True, "runs": 200},
                "outputSelection": {
                    "*": {
                        "*": ["abi", "evm.bytecode"]
                    }
                }
            }
        },
        solc_version=SOLC_VERSION,
        base_path=".",          # 👈 IMPORTANT
        allow_paths=".",        # 👈 CRITIQUE pour OpenZeppelin
    )

    try:
        contract = compiled["contracts"][contract_path.name][contract_name]
    except KeyError as e:
        raise Exception(
            f"Contract '{contract_name}' not found in {contract_path.name}. "
            f"Available: {list(compiled['contracts'][contract_path.name].keys())}"
        )

    abi = contract["abi"]
    bytecode = contract["evm"]["bytecode"]["object"]

    if not bytecode:
        raise Exception("Bytecode is empty (compilation failed)")

    return abi, bytecode
