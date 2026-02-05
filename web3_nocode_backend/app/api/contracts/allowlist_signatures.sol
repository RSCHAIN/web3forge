// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ECDSAAllowlist {
    address public signer; // admin qui signe off-chain
    mapping(address => bool) public claimed;

    event Claimed(address indexed user);

    constructor(address _signer) {
        signer = _signer;
    }

    function setSigner(address _signer) external {
        require(msg.sender == signer, "only current signer");
        signer = _signer;
    }

    function claim(bytes32 digest, uint8 v, bytes32 r, bytes32 s) external {
        require(!claimed[msg.sender], "already claimed");

        // Le digest doit être construit OFF-CHAIN de manière cohérente
        // ex: digest = keccak256(abi.encodePacked("ALLOW:", msg.sender));
        address recovered = ecrecover(toEthSignedMessageHash(digest), v, r, s);
        require(recovered == signer, "bad sig");

        claimed[msg.sender] = true;
        emit Claimed(msg.sender);
    }

    function toEthSignedMessageHash(bytes32 hash) public pure returns (bytes32) {
        // EIP-191 "\x19Ethereum Signed Message:\n32"
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
